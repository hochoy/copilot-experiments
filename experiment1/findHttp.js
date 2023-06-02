const acorn = require('acorn');
const path = require("path")
const walk = require('acorn-walk');
const escodegen = require('escodegen');
const fs = require('fs');

const httpMethods = ['get', 'post', 'put', 'patch', 'delete'];

function findMethodCalls(code, methodName) {
  const methodCalls = [];
  const ast = acorn.parse(code, { ecmaVersion: 2020, sourceType: 'module', locations: true });
  walk.recursive(ast, null, {
    CallExpression(node, state, c) {
      
      // print the location of the node in a human readable format
      console.log(`Found a ${node.type} calling a ${node.callee.type} at line ${node.loc.start.line}-${node.loc.end.line} and column ${node.loc.start.column} - ${node.loc.end.column}`)
      // console.log(node)
      console.log("=====================================")

      if (node.callee.type === 'MemberExpression' &&
        // node.callee.object.name === 'axios' &&
        httpMethods.includes(node.callee.property.name)) {

      const requestArgs = extractArguments(node.arguments);
      methodCalls.push({ property: node.callee.property.name, args: requestArgs });
    }
    walk.base.CallExpression(node, state, c);
    },
  });
  return methodCalls;
}

const extractArguments = (args) => {
    const extracted = [];
    args.forEach(arg => {
      try {
        if (arg.type === 'TemplateLiteral') {
          const templateLiteralNode = arg;
          let result = '';
          for (let i = 0; i < templateLiteralNode.quasis.length; i++) {
            result += templateLiteralNode.quasis[i].value.raw;
            if (i < templateLiteralNode.expressions.length) {
              result += escodegen.generate(templateLiteralNode.expressions[i]);
            }
          }
          extracted.push(result);
        } else {
          extracted.push(arg.value);
        }
      }catch(e){
        extracted.push(`unextractable :${arg}`)
      }
    });
    return extracted;
};

const filepath = path.resolve(__dirname, 'testFile.js')
const code = fs.readFileSync(filepath, 'utf8');

const methodCalls = findMethodCalls(code, 'get');
console.log(methodCalls);