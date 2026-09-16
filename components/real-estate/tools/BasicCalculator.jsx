"use client";

import { useState } from "react";
import { Calculator, Delete } from "lucide-react";

export default function BasicCalculator() {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? String(digit) : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const clearAll = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const backspace = () => {
    if (display.length <= 1) {
      setDisplay("0");
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const calculate = (firstValue, secondValue, op) => {
    switch (op) {
      case "+":
        return firstValue + secondValue;
      case "-":
        return firstValue - secondValue;
      case "×":
        return firstValue * secondValue;
      case "÷":
        return secondValue === 0 ? 0 : firstValue / secondValue;
      case "%":
        return (firstValue * secondValue) / 100;
      default:
        return secondValue;
    }
  };

  const performOperation = (nextOp) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOp);
  };

  const handleEquals = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const handlePercent = () => {
    const value = parseFloat(display) / 100;
    setDisplay(String(value));
  };

  const toggleSign = () => {
    setDisplay(String(parseFloat(display) * -1));
  };

  // ✅ Button component with larger size
  const CalcButton = ({ children, onClick, variant = "default" }) => {
    const variants = {
      default:
        "bg-muted text-foreground hover:bg-muted/70 active:scale-95",
      operator:
        "bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 active:scale-95 font-bold",
      equals:
        "bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 shadow-lg shadow-indigo-600/20",
      clear:
        "bg-red-500/15 text-red-400 hover:bg-red-500/25 active:scale-95 font-bold",
    };
    return (
      <button
        type="button"
        onClick={onClick}
        className={`flex h-16 items-center justify-center rounded-2xl text-xl font-semibold transition-all duration-150 sm:h-18 sm:text-2xl ${variants[variant]}`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
          <Calculator size={22} />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Basic Calculator</h2>
          <p className="text-xs text-muted-foreground">
            Simple arithmetic calculator
          </p>
        </div>
      </div>

      {/* Display */}
      <div className="mb-5 rounded-2xl border border-border bg-muted/40 p-6">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-mono tabular-nums">
            {previousValue !== null ? `${previousValue} ${operation || ""}` : ""}
          </span>
          <button
            type="button"
            onClick={backspace}
            className="rounded-lg p-1.5 transition hover:bg-muted hover:text-foreground"
            title="Backspace"
          >
            <Delete size={16} />
          </button>
        </div>
        <p className="break-all text-right text-4xl font-bold tabular-nums sm:text-5xl">
          {display}
        </p>
      </div>

      {/* Buttons Grid */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
        {/* Row 1 */}
        <CalcButton onClick={clearAll} variant="clear">
          AC
        </CalcButton>
        <CalcButton onClick={toggleSign}>±</CalcButton>
        <CalcButton onClick={handlePercent}>%</CalcButton>
        <CalcButton onClick={() => performOperation("÷")} variant="operator">
          ÷
        </CalcButton>

        {/* Row 2 */}
        <CalcButton onClick={() => inputDigit(7)}>7</CalcButton>
        <CalcButton onClick={() => inputDigit(8)}>8</CalcButton>
        <CalcButton onClick={() => inputDigit(9)}>9</CalcButton>
        <CalcButton onClick={() => performOperation("×")} variant="operator">
          ×
        </CalcButton>

        {/* Row 3 */}
        <CalcButton onClick={() => inputDigit(4)}>4</CalcButton>
        <CalcButton onClick={() => inputDigit(5)}>5</CalcButton>
        <CalcButton onClick={() => inputDigit(6)}>6</CalcButton>
        <CalcButton onClick={() => performOperation("-")} variant="operator">
          −
        </CalcButton>

        {/* Row 4 */}
        <CalcButton onClick={() => inputDigit(1)}>1</CalcButton>
        <CalcButton onClick={() => inputDigit(2)}>2</CalcButton>
        <CalcButton onClick={() => inputDigit(3)}>3</CalcButton>
        <CalcButton onClick={() => performOperation("+")} variant="operator">
          +
        </CalcButton>

        {/* Row 5 */}
        <div className="col-span-2">
          <CalcButton onClick={() => inputDigit(0)}>0</CalcButton>
        </div>
        <CalcButton onClick={inputDecimal}>.</CalcButton>
        <CalcButton onClick={handleEquals} variant="equals">
          =
        </CalcButton>
      </div>
    </div>
  );
}