/** @module assemblyscript/expressions */ /** */

import * as ts from "../typescript";
import { Expression } from "binaryen";
import { Compiler } from "../compiler";
import { Type, VariableBase, LocalVariable, ReflectionObjectKind } from "../reflection";
import { setReflectedType } from "../util";

/** Compiles an identifier expression. */
export function compileIdentifier(compiler: Compiler, node: ts.Identifier, contextualType: Type): Expression {
  const op = compiler.module;

  setReflectedType(node, contextualType);

  const reference = compiler.resolveReference(node, ReflectionObjectKind.GlobalVariable | ReflectionObjectKind.LocalVariable);
  if (reference instanceof VariableBase) {
    const variable = <VariableBase>reference;
    setReflectedType(node, variable.type);

    if (variable.isInlineable)
      return compiler.valueOf(variable.type, <number | Long>variable.constantValue);

    return variable instanceof LocalVariable
      ? op.getLocal((<LocalVariable>variable).index, compiler.typeOf(variable.type))
      : op.getGlobal(variable.name, compiler.typeOf(variable.type));
  }
  compiler.report(node, ts.DiagnosticsEx.Unresolvable_identifier_0, ts.getTextOfNode(node));
  return op.unreachable();
}

export default compileIdentifier;
