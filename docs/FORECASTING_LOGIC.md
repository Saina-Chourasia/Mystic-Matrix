# MYSTIC MATRIX AI Demand Forecasting & Inventory Intelligence Logic

> **Tagline:** *"The Enchanted Inventory for Every Potion and Prophecy."*

---

## 1. Overview & Method Selection

Traditional retail forecasting systems frequently fail when applied to high-volatility environments like Madam Hex's apothecary due to sudden demand spikes (such as Halloween sabbats) and variable supplier lead times.

**MYSTIC MATRIX** solves this by implementing **Holt's Linear Exponential Smoothing with Seasonal Multipliers** combined with **Safety Stock Buffer Theory** and **Continuous Review Reorder Point ($ROP$) Modeling**.

---

## 2. Mathematical Formulation

### A. Data Preprocessing & Continuous Time Series
Sales logs are sparse (transactions only occur on active shopping days). The engine reconstructs a continuous 90-day time series:
$$Y_t \in \{0, 1, 2, \dots\} \quad \text{for } t \in [1, 90]$$
Zero-sales days are explicitly imputed as $Y_t = 0$ to prevent artificially inflating demand velocity.

### B. Holt's Linear Exponential Smoothing (Level & Trend)
For each item, the series is decomposed into a **smoothed level** ($L_t$) and an **additive trend slope** ($T_t$):

$$\text{Level Equation: } L_t = \alpha Y_t + (1 - \alpha)(L_{t-1} + T_{t-1})$$
$$\text{Trend Equation: } T_t = \beta (L_t - L_{t-1}) + (1 - \beta) T_{t-1}$$

- $\alpha = 0.35$: Level smoothing parameter (weights recent observations while dampening noise).
- $\beta = 0.15$: Trend smoothing parameter (detects authentic expansion or contraction).

### C. Seasonal Event Surge Modeling (Halloween Multiplier)
Products flagged as seasonal reagents (*Fairy Wings, Love Potion, Ghost Pepper, Bat Wings, Disguise Potion*, etc.) receive an empirical event multiplier calibrated on historical October spikes:

$$S_{\text{item}} = \begin{cases}
3.2 & \text{Love Potion} \\
2.8 & \text{Fairy Wings} \\
2.7 & \text{Disguise Potion} \\
2.5 & \text{Ghost Pepper} \\
2.2 & \text{Flying Potion / Vampire Blood} \\
2.0 & \text{Bat Wings} \\
1.7 & \text{Mandrake Roots} \\
1.0 & \text{Evergreen Non-surge Items (e.g. Dragon Scales, Healing Potion)}
\end{cases}$$

The user-interactive **Halloween Simulator Slider** modulates this factor dynamically via multiplier $M \in [1.0, 2.5]$:
$$S_{\text{effective}} = S_{\text{item}} \times M$$

### D. Multi-Horizon Forecast Projections
The point forecast for day $t+k$ ($k \in [1, 30]$) is:
$$\hat{Y}_{t+k} = \max\left(0.1, \; (L_t + k \cdot T_t \cdot \gamma) \times S_{\text{effective}}(k)\right)$$
*(where $\gamma = 0.2$ is a dampening coefficient to prevent linear runaway, and $S_{\text{effective}}(k)$ gradually tapers off post-Halloween).*

### E. 95% Confidence Intervals
Prediction uncertainty expands with the forecasting horizon $k$ and daily sales standard deviation $\sigma_d$:
$$\text{Margin of Error: } \text{MoE}_k = 1.96 \times \sigma_d \times \sqrt{\frac{k}{5}}$$
$$\text{Upper Bound: } \hat{Y}_{t+k}^{\text{upper}} = \hat{Y}_{t+k} + \text{MoE}_k$$
$$\text{Lower Bound: } \hat{Y}_{t+k}^{\text{lower}} = \max\left(0, \; \hat{Y}_{t+k} - \text{MoE}_k\right)$$

---

## 3. Inventory Intelligence & Automation

### A. Safety Stock ($SS$)
Buffers against demand surges during the replenishment delay:
$$SS = \max\left(\text{MinStock}, \; \left\lceil Z \times \sigma_d \times \sqrt{L} \times \phi \right\rceil\right)$$
- $Z = 1.65$ (corresponds to a 95% service level)
- $L$ = Realm supplier lead time in days
- $\sigma_d$ = Standard deviation of daily sales
- $\phi = 1.4$ for Halloween surge items, $1.0$ otherwise

### B. Reorder Point ($ROP$)
The inventory threshold triggering an automated reorder:
$$ROP = \left\lceil (\bar{d}_{\text{projected}} \times L) + SS \right\rceil$$
Where $\bar{d}_{\text{projected}} = \frac{\text{Forecast}_{\text{7-day}}}{7}$.

### C. Suggested Reorder Quantity ($ROQ$)
$$\text{If } \text{CurrentStock} \le ROP: \quad ROQ = \max\left(0, \; \max(\text{MaxStock}, \; \text{Forecast}_{\text{30-day}} + SS) - \text{CurrentStock}\right)$$
$$\text{Otherwise: } \quad ROQ = 0$$

### D. Stockout Risk Countdown
$$\text{Days Remaining} = \begin{cases}
0 & \text{if CurrentStock } \le 0 \\
\frac{\text{CurrentStock}}{\bar{d}_{\text{projected}}} & \text{if } \bar{d}_{\text{projected}} > 0 \\
999 & \text{otherwise}
\end{cases}$$

### E. Overstock Detection Condition
An item is flagged as **OVERSTOCKED** when:
$$\text{CurrentStock} > 2.2 \times \text{Forecast}_{\text{30-day}} \quad \text{AND} \quad \text{CurrentStock} > 2 \times \text{MinStockLevel}$$
*(Example: Stardust has 145 units on shelf vs 24 monthly demand, trapping 2,175 Gold Galleons).*

---

## 4. Inventory Health Index ($IHI$)

A holistic composite health score from $0$ to $100$:

$$IHI = (0.40 \times \text{Availability}) + (0.30 \times \text{Overstock Control}) + (0.30 \times \text{Buffer Safety})$$

1. **Availability Score (40%):** Percentage of active catalog not in critical stockout:
   $$\text{Availability} = \frac{N_{\text{total}} - (N_{\text{critical}} + N_{\text{stockout}})}{N_{\text{total}}} \times 100$$
2. **Overstock Control (30%):** Percentage of catalog free from excessive capital blockage:
   $$\text{Overstock Control} = \frac{N_{\text{total}} - N_{\text{overstocked}}}{N_{\text{total}}} \times 100$$
3. **Buffer Safety (30%):** Percentage of catalog with $> 5$ days of remaining runway:
   $$\text{Buffer Safety} = \frac{N_{\text{safe}}}{N_{\text{total}}} \times 100$$

### Grade Boundaries:
- **90–100**: Grade A+ (*Supreme Harmony*)
- **80–89**: Grade A (*Enchanted Balance*)
- **70–79**: Grade B (*Minor Hex Detected*)
- **60–69**: Grade C (*Apothecary Volatility*)
- **< 60**: Grade D (*Critical Curse Imminent*)

