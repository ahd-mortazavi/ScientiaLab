// ScientiaLab — Position Size & Risk Calculator
// Pure client-side, no external requests, no dependencies.
// Educational tool only: turns account size, risk %, entry, and stop-loss
// into a position size that keeps a single trade's risk to a fixed
// share of the account.

(function () {
  "use strict";

  const form = document.getElementById("risk-calculator");
  if (!form) return; // tools section not present on this page

  const resultsBox = document.getElementById("risk-results");
  const rrRow = document.getElementById("result-rr-row");
  const noteEl = document.getElementById("result-note");

  function formatNumber(value, decimals) {
    if (!isFinite(value)) return "—";
    return value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  function calculate(event) {
    event.preventDefault();

    const accountSize = parseFloat(document.getElementById("account-size").value);
    const riskPercent = parseFloat(document.getElementById("risk-percent").value);
    const entryPrice = parseFloat(document.getElementById("entry-price").value);
    const stopPrice = parseFloat(document.getElementById("stop-price").value);
    const targetRaw = document.getElementById("target-price").value;
    const targetPrice = targetRaw === "" ? null : parseFloat(targetRaw);

    noteEl.textContent = "";
    rrRow.hidden = true;

    if (
      !isFinite(accountSize) || accountSize <= 0 ||
      !isFinite(riskPercent) || riskPercent <= 0 ||
      !isFinite(entryPrice) || entryPrice <= 0 ||
      !isFinite(stopPrice) || stopPrice <= 0
    ) {
      resultsBox.hidden = false;
      document.getElementById("result-risk-amount").textContent = "—";
      document.getElementById("result-shares").textContent = "—";
      document.getElementById("result-position-value").textContent = "—";
      noteEl.textContent = "Enter positive numbers for account size, risk %, entry price, and stop-loss price.";
      return;
    }

    const perUnitRisk = Math.abs(entryPrice - stopPrice);

    if (perUnitRisk === 0) {
      resultsBox.hidden = false;
      document.getElementById("result-risk-amount").textContent = "—";
      document.getElementById("result-shares").textContent = "—";
      document.getElementById("result-position-value").textContent = "—";
      noteEl.textContent = "Entry price and stop-loss price can't be equal — there would be no defined risk per unit.";
      return;
    }

    const riskAmount = accountSize * (riskPercent / 100);
    const shares = Math.floor(riskAmount / perUnitRisk);
    const positionValue = shares * entryPrice;

    document.getElementById("result-risk-amount").textContent = formatNumber(riskAmount, 2);
    document.getElementById("result-shares").textContent = formatNumber(shares, 0) + (shares === 1 ? " unit" : " units");
    document.getElementById("result-position-value").textContent = formatNumber(positionValue, 2);

    let note = "";

    if (shares === 0) {
      note = "The stop distance is wide relative to your risk budget — this setup rounds down to zero units at the chosen risk %.";
    } else if (positionValue > accountSize) {
      note = "This position size exceeds your account size, which implies leverage. Reduce risk % or widen the stop if you don't intend to use margin.";
    }

    if (targetPrice !== null && isFinite(targetPrice) && targetPrice > 0) {
      const rewardPerUnit = Math.abs(targetPrice - entryPrice);
      const rrRatio = rewardPerUnit / perUnitRisk;
      document.getElementById("result-rr").textContent = "1 : " + formatNumber(rrRatio, 2);
      rrRow.hidden = false;
    }

    noteEl.textContent = note;
    resultsBox.hidden = false;
  }

  form.addEventListener("submit", calculate);
})();

// ScientiaLab — Compound Growth & DCA Calculator
// Pure client-side, no external requests, no dependencies.
// Educational tool only: projects a starting balance plus steady monthly
// contributions forward at a constant assumed annual return, compounded
// monthly. Not a forecast — real returns are never constant.
(function () {
  "use strict";

  const form = document.getElementById("growth-calculator");
  if (!form) return; // tools section not present on this page

  const resultsBox = document.getElementById("growth-results");
  const noteEl = document.getElementById("growth-result-note");

  function formatNumber(value, decimals) {
    if (!isFinite(value)) return "—";
    return value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  function showPlaceholders(message) {
    resultsBox.hidden = false;
    document.getElementById("result-future-value").textContent = "—";
    document.getElementById("result-total-contributed").textContent = "—";
    document.getElementById("result-total-growth").textContent = "—";
    noteEl.textContent = message;
  }

  function calculate(event) {
    event.preventDefault();

    const initialRaw = document.getElementById("initial-investment").value;
    const monthlyRaw = document.getElementById("monthly-contribution").value;
    const initial = initialRaw === "" ? 0 : parseFloat(initialRaw);
    const monthly = monthlyRaw === "" ? 0 : parseFloat(monthlyRaw);
    const annualReturn = parseFloat(document.getElementById("annual-return").value);
    const years = parseFloat(document.getElementById("years").value);

    noteEl.textContent = "";

    if (!isFinite(annualReturn) || !isFinite(years) || years <= 0) {
      showPlaceholders("Enter an expected annual return and a number of years greater than zero.");
      return;
    }

    if (!isFinite(initial) || !isFinite(monthly) || initial < 0 || monthly < 0) {
      showPlaceholders("Initial investment and monthly contribution can't be negative.");
      return;
    }

    if (initial <= 0 && monthly <= 0) {
      showPlaceholders("Enter an initial investment, a monthly contribution, or both.");
      return;
    }

    const monthlyRate = annualReturn / 100 / 12;
    const months = years * 12;

    let futureValueLumpSum;
    let futureValueContributions;

    if (Math.abs(monthlyRate) < 1e-12) {
      futureValueLumpSum = initial;
      futureValueContributions = monthly * months;
    } else {
      const growthFactor = Math.pow(1 + monthlyRate, months);
      futureValueLumpSum = initial * growthFactor;
      futureValueContributions = monthly * ((growthFactor - 1) / monthlyRate);
    }

    const futureValue = futureValueLumpSum + futureValueContributions;
    const totalContributed = initial + monthly * months;
    const totalGrowth = futureValue - totalContributed;

    document.getElementById("result-future-value").textContent = formatNumber(futureValue, 2);
    document.getElementById("result-total-contributed").textContent = formatNumber(totalContributed, 2);
    document.getElementById("result-total-growth").textContent = formatNumber(totalGrowth, 2);

    let note = "";
    if (annualReturn < 0) {
      note = "A negative return means the balance shrinks over time even with steady contributions.";
    } else if (totalGrowth < 0) {
      note = "Total growth is negative at this return rate — contributions alone outweigh the assumed gains.";
    }

    noteEl.textContent = note;
    resultsBox.hidden = false;
  }

  form.addEventListener("submit", calculate);
})();
