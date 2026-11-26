# ScientiaLab

**Putting generative AI to work in finance, built in public.**

ScientiaLab is Andrew More's open portfolio: AI experiments, browser-based calculators and Python notebooks
that anyone can run, inspect and adapt. The focus is AI integration — connecting large language models to
data, tools and people, especially in finance and investment — alongside the quantitative foundations
that make those systems trustworthy.

**Live site:** https://ahd-mortazavi.github.io/ScientiaLab/

## What's here

| Project | Type | Try it |
| --- | --- | --- |
| Position Size & Risk Calculator | Browser tool (JavaScript) | [Open](https://ahd-mortazavi.github.io/ScientiaLab/tools/position-size.html) |
| Compound Growth & DCA Calculator | Browser tool (JavaScript) | [Open](https://ahd-mortazavi.github.io/ScientiaLab/tools/compound-growth.html) |
| Backtesting Engine From Scratch | Jupyter notebook | [Colab](https://colab.research.google.com/github/ahd-mortazavi/ScientiaLab/blob/main/backtesting_engine_from_scratch.ipynb) · [GitHub](backtesting_engine_from_scratch.ipynb) |
| An Illustrative Trend Screener | Jupyter notebook | [Colab](https://colab.research.google.com/github/ahd-mortazavi/ScientiaLab/blob/main/stacked_uptrend_screener.ipynb) · [GitHub](stacked_uptrend_screener.ipynb) |

## Coming next

- `scientialab` Python library with tests and CI
- Run every notebook in the browser
- Backtest Playground
- Self-updating UK macro dashboard
- AI-drafted weekly macro notes, reviewed by a human before publishing
- ScientiaLab MCP server, so AI assistants can call these tools
- A tutor that answers from ScientiaLab's own notebooks, with citations

## Repository structure

```
/
├── index.html            # homepage
├── style.css             # shared styles
├── script.js             # calculator logic (no dependencies)
├── tools/                # one page per calculator
├── assets/               # favicon and link-preview images
└── *.ipynb               # notebooks
```

## Principles

- **Runs anywhere.** Tools are plain client-side JavaScript; notebooks use synthetic data, so every cell runs
  without an API key or internet connection.
- **Mechanics over strategy.** Examples teach how things work and where they mislead. Tickers in examples are
  fictional and thresholds are illustrative.
- **Human in the loop.** Any AI-generated content is reviewed by a person and labelled before it is published.

## Disclaimer

Educational content only. Nothing here is financial advice, a recommendation, or an offer to buy or sell any
security.

## Licence

Code is released under the [MIT licence](LICENSE).
