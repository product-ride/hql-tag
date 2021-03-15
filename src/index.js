import gql from "graphql-tag";
import { whereOperators, orderOperators } from "./constant";
import { isNode } from "./utils";

const deleteArguementsIndex = [];

const hql = (stringArray, ...expressions) => {
  // Generate AST from graphql-tag
  const gqlAst = gql(stringArray, ...expressions);
  // Return if its not query
  if (gqlAst.definitions[0].operation !== "query") return gqlAst;
  // Traverse through AST and modify nodes
  visit(gqlAst);
  // Delete the temporary nodes
  gqlAst.definitions[0].selectionSet.selections[0].arguments = gqlAst.definitions[0].selectionSet.selections[0].arguments.filter(
    (_, index) => deleteArguementsIndex.indexOf(index) === -1
  );
  return gqlAst;
};

function processArguements(node, parent, key, index) {
  // Process only the nodes that are arguments
  if (node.kind === "Argument") {
    const argumentName = node.name.value;
    const argumentValue = { ...node.value };
    const argumentNameArray = argumentName.split("_");
    const argumentOperator = argumentNameArray[argumentNameArray.length - 1];
    argumentNameArray.pop();

    // Modify Node with where conditions
    if (whereOperators.indexOf(argumentOperator) > -1) {
      // Index of argument with where
      const whereObjIndex = parent.arguments.findIndex((argument) => {
        return argument.name.value === "where";
      });

      // Template to hold value of the where clause
      const valueObjTemplate = {
        kind: "ObjectField",
        name: {
          kind: "Name",
          value: `_${argumentOperator}`,
        },
        value: { ...argumentValue },
      };

      // Template for entire Field in where clause
      const FieldObjTemplate = {
        kind: "ObjectField",
        name: {
          kind: "Name",
          value: argumentNameArray.join("_"),
        },
        value: {
          kind: "ObjectValue",
          fields: [],
        },
      };

      // Check If a where argument already exists
      if (whereObjIndex > -1) {
        // Index of field with current field
        const FieldObjIndex = parent.arguments[
          whereObjIndex
        ].value.fields.findIndex((field) => {
          return field.name.value === argumentNameArray.join("_");
        });

        // Add current node to delete list
        deleteArguementsIndex.push(index);

        // Check If the current field already exist in the where clause
        if (FieldObjIndex > -1) {
          // Add new condition for the existing field
          parent.arguments[whereObjIndex].value.fields[
            FieldObjIndex
          ].value.fields.push(valueObjTemplate);
        } else {
          // Add new field to the existing where clause
          FieldObjTemplate.value.fields.push(valueObjTemplate);
          parent.arguments[whereObjIndex].value.fields.push(FieldObjTemplate);
        }
      }
      // Replace current node with new argument node
      else {
        const argumentTemplate = {
          kind: "Argument",
          name: {
            kind: "Name",
            value: "where",
          },
          value: {
            kind: "ObjectValue",
            fields: [],
          },
        };
        FieldObjTemplate.value.fields.push(valueObjTemplate);
        argumentTemplate.value.fields.push(FieldObjTemplate);
        parent.arguments[index] = argumentTemplate;
      }
    }

    // Modify Node with order_by conditions
    if (orderOperators.indexOf(argumentOperator) > -1) {
      // Index of argument with order_by
      const orderObjIndex = parent.arguments.findIndex((argument) => {
        return argument.name.value === "order_by";
      });

      // Template to hold Field of the order_by clause
      const FieldObjTemplate = {
        kind: "ObjectField",
        name: {
          kind: "Name",
          value: argumentNameArray.join("_"),
        },
        value: {
          kind: "EnumValue",
          value: argumentValue.value,
        },
      };

      // Check if order_by argument exists already
      if (orderObjIndex > -1) {
        // Index of field with current field
        const FieldObjIndex = parent.arguments[
          orderObjIndex
        ].value.fields.findIndex((field) => {
          return field.name.value === argumentNameArray.join("_");
        });

        // Add current node to delete list
        deleteArguementsIndex.push(index);

        // Check If the current field already exist in order_by clause
        if (FieldObjIndex > -1) {
          // Add new condition for the existing field
          parent.arguments[orderObjIndex].value.fields[
            FieldObjIndex
          ].value.value = argumentValue.value;
        } else {
          // Add new field to the existing order_by clause
          parent.arguments[orderObjIndex].value.fields.push(FieldObjTemplate);
        }
      }
      // Replace current node with new argument node
      else {
        const argumentTemplate = {
          kind: "Argument",
          name: {
            kind: "Name",
            value: "order_by",
          },
          value: {
            kind: "ObjectValue",
            fields: [],
          },
        };
        argumentTemplate.value.fields.push(FieldObjTemplate);
        parent.arguments[index] = argumentTemplate;
      }
    }
  }
}

// Traversal function
function visit(ast) {
  function _visit(node, parent, key, index) {
    processArguements(node, parent, key, index);
    const keys = Object.keys(node);
    for (let i = 0; i < keys.length; i++) {
      const child = node[keys[i]];
      if (Array.isArray(child)) {
        for (let j = 0; j < child.length; j++) {
          _visit(child[j], node, keys[i], j);
        }
      } else if (isNode(child)) {
        _visit(child, node, keys[i]);
      }
    }
  }
  _visit(ast, null);
}

export default hql;
