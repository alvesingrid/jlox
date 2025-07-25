import { TokenType } from './TokenType.js';

class RuntimeError extends Error {
  constructor(token, message) {
    super(message);
    this.token = token;
  }
}

export class Interpreter {

  interpret(expression) {
    try {
      const value = this.evaluate(expression);
      console.log(this.stringify(value));
    } catch (error) {
      console.error(error.message);
    }
  }

  evaluate(expr) {
    return expr.accept(this);
  }

  visitLiteralExpr(expr) {
    return expr.value;
  }
  
  visitGroupingExpr(expr) {
    return this.evaluate(expr.expression);
  }
  
  visitUnaryExpr(expr) {
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.MINUS:
        this.checkNumberOperand(expr.operator, right);
        return -Number(right);
      case TokenType.BANG:
        return !this.isTruthy(right);
    }

    return null;
  }
  
  visitBinaryExpr(expr) {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.GREATER:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) > Number(right);
      case TokenType.GREATER_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) >= Number(right);
      case TokenType.LESS:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) < Number(right);
      case TokenType.LESS_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) <= Number(right);
      case TokenType.BANG_EQUAL: return !this.isEqual(left, right);
      case TokenType.EQUAL_EQUAL: return this.isEqual(left, right);
      case TokenType.MINUS:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) - Number(right);
      case TokenType.PLUS:
        if (typeof left === 'number' && typeof right === 'number') {
          return left + right;
        }
        if (typeof left === 'string' && typeof right === 'string') {
          return left + right;
        }
        throw new RuntimeError(expr.operator, 'Operands must be two numbers or two strings.');
      case TokenType.SLASH:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) / Number(right);
      case TokenType.STAR:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) * Number(right);
    }

    return null;
  }

visitPostfixExpr(expr) {
    const left = this.evaluate(expr.left);

    switch (expr.operator.type) {
      case TokenType.BANG:
        this.checkNumberOperand(expr.operator, left);

        // Validações para fatorial
        if (!Number.isInteger(left)) {
          throw new RuntimeError(expr.operator, "Operand for factorial must be an integer.");
        }
        if (left < 0) {
          throw new RuntimeError(expr.operator, "Operand for factorial must be a non-negative number.");
        }

        const factorial = (n) => {
          if (n === 0) return 1;
          let result = 1;
          for (let i = 2; i <= n; i++) {
            result *= i;
          }
          return result;
        };

        return factorial(left);
    }

    return null;
}

  
  // --- MÉTODOS DE AJUDA ---

  isTruthy(object) {
    if (object === null) return false;
    if (typeof object === 'boolean') return object;
    return true;
  }
  
  isEqual(a, b) {
    if (a === null && b === null) return true;
    if (a === null) return false;
    return a === b;
  }
  
  checkNumberOperand(operator, operand) {
    if (typeof operand === 'number') return;
    throw new RuntimeError(operator, 'Operand must be a number.');
  }
  
  checkNumberOperands(operator, left, right) {
    if (typeof left === 'number' && typeof right === 'number') return;
    throw new RuntimeError(operator, 'Operands must be numbers.');
  }
  
  stringify(object) {
    if (object === null) return "nil";
    return object.toString();
  }
}