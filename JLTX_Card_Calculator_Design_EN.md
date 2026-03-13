# JLTX Card Collection Calculator -- Design Document

## 1 Overview

JLTX Card Collection Calculator is a small web tool used to calculate
the optimal strategy for composing cards.

Users input a set of **4‑digit ternary cards**, and the system analyzes
them based on predefined disassemble and compose rules to determine:

-   Which cards should be disassembled
-   Which cards should be composed
-   How many cards can be successfully composed
-   How many fragments remain

The main objective of the system is:

> Maximize the number of composed cards given the available cards and
> fragment pool.

------------------------------------------------------------------------

## 2 Input Specification

### 2.1 Card Data

Input consists of:

10 rows × 5 columns (50 cards in total)

Each card must be a **4‑digit ternary number** using only:

0, 1, 2

Example:

    2101 2202 1122 1010 0121
    0020 0021 0022 0100 0101
    ...

Validation rules:

-   Exactly **10 rows**
-   Each row contains **5 cards**
-   Each card must match:

```{=html}
<!-- -->
```
    ^[012]{4}$

------------------------------------------------------------------------

### 2.2 Initial Fragments

Users may provide an initial fragment pool.

Field:

Initial Fragments

Default value:

0

These fragments are available before the algorithm begins.

------------------------------------------------------------------------

## 3 Card Rules

Each card has two important attributes:

-   Disassemble Gain
-   Compose Cost

Both are derived from **ternary → decimal conversion**.

------------------------------------------------------------------------

### 3.1 Ternary to Decimal Conversion

Card values are interpreted as **base‑3 numbers**.

Example:

2101 (base 3)

= 2×27 + 1×9 + 0×3 + 1\
= 64

In JavaScript:

``` javascript
parseInt(card, 3)
```

------------------------------------------------------------------------

### 3.2 Disassemble Rule

Disassembling a card produces fragments.

Formula:

Disassemble Gain = ternaryToDecimal(card)

Example:

Card: 2101\
Decimal value: 64

Fragments gained: 64

------------------------------------------------------------------------

### 3.3 Compose Rule

Composing a card consumes fragments.

Formula:

Compose Cost = 243 − 3 × decimalValue

Example:

Card: 2101\
decimalValue = 64

Compose Cost = 243 − 3×64 = 51

------------------------------------------------------------------------

### 3.4 Value Range

For a 4‑digit ternary card:

Minimum: 0000 = 0\
Maximum: 2222 = 80

Therefore:

-   Disassemble Gain: 0 → 80
-   Compose Cost: 243 → 3

Key observation:

Higher card values → produce more fragments when disassembled\
→ require fewer fragments to compose

------------------------------------------------------------------------

## 4 Core Algorithm

Algorithm name:

**Greedy Two‑Pointer Algorithm**

Goal:

Maximize the number of composed cards.

------------------------------------------------------------------------

## 5 Algorithm Insight

From the formulas we observe:

-   Higher value cards → lower compose cost
-   Lower value cards → better candidates for disassembly

Therefore the strategy is:

**Disassemble small cards, compose large cards.**

------------------------------------------------------------------------

## 6 Algorithm Steps

### Step 1 Calculate Card Attributes

For each card:

    decimalValue = ternaryToDecimal(card)
    disassembleGain = decimalValue
    composeCost = 243 − 3 × decimalValue

------------------------------------------------------------------------

### Step 2 Sort Cards

Sort cards by decimal value in **ascending order**:

small → large

------------------------------------------------------------------------

### Step 3 Initialize Two Pointers

    left  → smallest card
    right → largest card
    fragmentPool = initialFragments

------------------------------------------------------------------------

### Step 4 Greedy Loop

    If fragmentPool ≥ composeCost(largestCard)

        compose largest card
        fragmentPool -= composeCost
        right--

    Else

        disassemble smallest card
        fragmentPool += disassembleGain
        left++

Repeat until no further operations are possible.

------------------------------------------------------------------------

### Step 5 Last Card Case

If only one card remains:

    If fragmentPool ≥ composeCost
        compose it
    Else
        mark as unused

------------------------------------------------------------------------

## 7 Data Structure

Each card can be represented as:

``` javascript
{
  raw: "2101",
  decimal: 64,
  disassembleGain: 64,
  composeCost: 51,
  row: 0,
  col: 0,
  state: "unused"
}
```

Possible states:

-   compose
-   disassemble
-   unused

Displayed in UI as:

-   Compose
-   Disassemble
-   Unused

------------------------------------------------------------------------

## 8 Output

### Card Table

The original **10 × 5 layout** is preserved.

Each card shows:

-   Card value
-   State

Example:

    2101
    Compose

------------------------------------------------------------------------

### Summary

Displayed statistics:

-   Initial Fragments
-   Composed Cards
-   Remaining Fragments

Example:

Summary

Initial Fragments: 0\
Composed Cards: 8\
Remaining Fragments: 33

------------------------------------------------------------------------

## 9 Time Complexity

Let:

n = number of cards

In this tool:

n = 50

Complexity:

-   Sorting: O(n log n)
-   Greedy iteration: O(n)

Total complexity:

O(n log n)

Execution time is effectively instantaneous for this input size.

------------------------------------------------------------------------

## 10 Example

Input:

    2101 2202 1122 1010 0121
    0020 0021 0022 0100 0101
    ...

Initial Fragments:

0

Output example:

Composed Cards: 8\
Remaining Fragments: 33

Card states displayed as:

-   Compose
-   Disassemble
-   Unused

------------------------------------------------------------------------

## 11 Future Improvements

Potential enhancements:

-   Show decimal value beside each card
-   Display fragments needed for next composition
-   Excel-style paste support
-   Export results
-   State color highlighting
