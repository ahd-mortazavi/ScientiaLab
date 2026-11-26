// ScientiaLab — calculators
// Pure client-side: no external requests, no dependencies, no tracking.
// Educational tools only — not financial advice.

(function () {
  "use strict";

  var SYMBOLS = { GBP: "£", USD: "$", EUR: "€" };

  function formatNumber(value, decimals) {
    if (!isFinite(value)) return "—";
    return value.toLocaleString("en-GB", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  function readNumber(id) {
    var el = document.getElementById(id);
    if (!el || el.value.trim() === "") return null;
    return parseFloat(el.value);
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // Currency selector shared by both tools: buttons with data-currency inside [data-currency-group].
  function setupCurrency(onChange) {
    var group = document.querySelector("[data-currency-group]");
    var state = { code: "GBP" };
    if (!group) return state;
    var buttons = group.querySelectorAll("button[data-currency]");
    Array.prototype.forEach.call(buttons, function (btn) {
      btn.addEventListener("click", function () {
        state.code = btn.getAttribute("data-currency");
        Array.prototype.forEach.call(buttons, function (b) {
          b.setAttribute("aria-pressed", b === btn ? "true" : "false");
        });
        Array.prototype.forEach.call(document.querySelectorAll("[data-currency-symbol]"), function (s) {
          s.textContent = SYMBOLS[state.code];
        });
        onChange();
      });
    });
    return state;
  }

  // ---------- Position Size & Risk Calculator ----------
  // Direction is inferred from the stop: below entry = long, above = short.
  // A target on the stop's side of entry is flagged instead of scored.
  function initRiskCalculator() {
    var form = document.getElementById("risk-calculator");
    if (!form) return;

    var currency = setupCurrency(calculate);

    function calculate(event) {
      if (event) event.preventDefault();
      var sym = SYMBOLS[currency.code];
      var account = readNumber("account-size");
      var riskPct = readNumber("risk-percent");
      var entry = readNumber("entry-price");
      var stop = readNumber("stop-price");
      var target = readNumber("target-price");

      var out = { risk: "—", units: "—", value: "—", rr: "—", direction: "—", note: "" };

      var valid = account > 0 && riskPct > 0 && entry > 0 && stop > 0;
      if (!valid) {
        out.note = "Enter positive numbers for account size, risk %, entry price and stop-loss price.";
      } else if (entry === stop) {
        out.note = "Entry and stop-loss can't be equal: there would be no defined risk per unit.";
      } else {
        var isLong = stop < entry;
        var perUnitRisk = Math.abs(entry - stop);
        var cashAtRisk = account * (riskPct / 100);
        var units = Math.floor(cashAtRisk / perUnitRisk);
        var positionValue = units * entry;

        out.direction = isLong ? "Long (stop below entry)" : "Short (stop above entry)";
        out.risk = sym + formatNumber(cashAtRisk, 2);
        out.units = formatNumber(units, 0) + (units === 1 ? " unit" : " units");
        out.value = sym + formatNumber(positionValue, 2);

        if (target !== null && isFinite(target) && target > 0) {
          var wrongSide = isLong ? target <= entry : target >= entry;
          if (wrongSide) {
            out.note = isLong
              ? "Your target is at or below entry on a long trade, so reward:risk isn't shown."
              : "Your target is at or above entry on a short trade, so reward:risk isn't shown.";
          } else {
            out.rr = "1 : " + formatNumber(Math.abs(target - entry) / perUnitRisk, 2);
          }
        }

        if (units === 0) {
          out.note = "The stop is wide relative to your risk budget, so this rounds down to zero units.";
        } else if (positionValue > account) {
          out.note = "This position is larger than your account, which implies leverage. Lower the risk % or widen the stop if you don't intend to use margin.";
        }
      }

      setText("result-direction", out.direction);
      setText("result-risk-amount", out.risk);
      setText("result-shares", out.units);
      setText("result-position-value", out.value);
      setText("result-rr", out.rr);
      setText("result-note", out.note);
    }

    form.addEventListener("submit", calculate);
    form.addEventListener("input", function () { calculate(); });
    calculate();
  }

  // ---------- Compound Growth & DCA Calculator ----------
  // Constant annual return compounded monthly, contributions at the end of each month.
  function initGrowthCalculator() {
    var form = document.getElementById("growth-calculator");
    if (!form) return;

    var currency = setupCurrency(calculate);

    function calculate(event) {
      if (event) event.preventDefault();
      var sym = SYMBOLS[currency.code];
      var initial = readNumber("initial-investment") || 0;
      var monthly = readNumber("monthly-contribution") || 0;
      var annualReturn = readNumber("annual-return");
      var years = readNumber("years");

      var out = { fv: "—", contributed: "—", growth: "—", note: "" };

      if (annualReturn === null || !isFinite(annualReturn) || years === null || !(years > 0)) {
        out.note = "Enter an expected annual return and a number of years greater than zero.";
      } else if (initial < 0 || monthly < 0) {
        out.note = "Initial investment and monthly contribution can't be negative.";
      } else if (initial <= 0 && monthly <= 0) {
        out.note = "Enter an initial investment, a monthly contribution, or both.";
      } else {
        var monthlyRate = annualReturn / 100 / 12;
        var months = Math.round(years * 12);
        var fvLump, fvContrib;
        if (Math.abs(monthlyRate) < 1e-12) {
          fvLump = initial;
          fvContrib = monthly * months;
        } else {
          var factor = Math.pow(1 + monthlyRate, months);
          fvLump = initial * factor;
          fvContrib = monthly * ((factor - 1) / monthlyRate);
        }
        var fv = fvLump + fvContrib;
        var contributed = initial + monthly * months;
        var growth = fv - contributed;

        out.fv = sym + formatNumber(fv, 2);
        out.contributed = sym + formatNumber(contributed, 2);
        out.growth = sym + formatNumber(growth, 2);

        if (annualReturn < 0) {
          out.note = "A negative return means the balance shrinks over time, even with steady contributions.";
        } else if (months !== years * 12) {
          out.note = "Years are rounded to the nearest whole month (" + months + " months).";
        }
      }

      setText("result-future-value", out.fv);
      setText("result-total-contributed", out.contributed);
      setText("result-total-growth", out.growth);
      setText("growth-result-note", out.note);
    }

    form.addEventListener("submit", calculate);
    form.addEventListener("input", function () { calculate(); });
    calculate();
  }

  initRiskCalculator();
  initGrowthCalculator();
})();
