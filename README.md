## hql-tag
![CI](https://github.com/product-ride/hql-tag/workflows/hql-tag_CI/badge.svg)
[![Version](https://img.shields.io/npm/v/hql-tag.svg)](https://npmjs.org/package/hql-tag)
[![Downloads/week](https://img.shields.io/npm/dw/hql-tag.svg)](https://npmjs.org/package/hql-tag)
[![License](https://img.shields.io/npm/l/hql-tag.svg)](https://github.com/product-ride/hql-tag/blob/master/package.json)

`hql-tag` is a Hasura specific wrapper over `graphql-tag`. In Hasura GraphQL backend, we can query data with arguments directly without adding to backend schema using `where` argument and sort data using `order_by` argument. However, in a real-world query involving multiple `where` conditions on multiple arguments, the queries are not that readable. 

`hql-tag` solves this issue by providing shorthand way of writing `where` and `order_by` arguments.

[DEMO](https://codesandbox.io/s/hardcore-tdd-d9o1s?file=/src/App.js) - Link to codesandbox to compare and play around with `graphql-tag` & `hql-tag`

> Note: This library works fine with all the GraphQL Client frameworks that works with `graphql-tag`.

### Installation

Install the dependencies. Please note, `graphql` & `graphql-tag` are peerDependencies

```sh
yarn add graphql graphql-tag hql-tag

or 

npm i graphql graphql-tag hql-tag
```

### Usage

Imagine a clumsy query as below: 

```js
import gql from 'graphql-tag';

const clumsyHasuraQuery = gql`
  query getProductById($id: Int!) {
    product(
      limit: 10
      offset: 10
      where: { id: { _eq: $id }, quantity: { _gte: 10 }, type_id: { _eq: 10, _gte: 22, _lte: 5, _in: [72,73,74] } }
      order_by: {category: asc, description: desc}
    ) {
      category
      id
    }
  }
`;
```

The above query can be made more readable and elegant using `hql-tag` as below:

> Note: It is recommended to import `hql-tag` as `gql` to get syntax highlighting and linting support from vscode extensions

```js
import gql from 'hql-tag';

const elegantHasuraQuery = gql`
  query getProductById($id: Int!) {
    product(
      limit: 10
      offset: 10
      id_eq: $id
      quantity_gte: 10
      type_id_eq: 10
      type_id_gte: 22
      type_id_lte: 5
      type_id_in: [72, 73, 74]
      category_ord: asc
      description_order: desc
    ) {
      category
      id
    }
  }
`;
```

#### Steps to use: 

- Import `gql` from `hql-tag` instead of `graphql-tag`
- Remove `where` and `order_by` arguments
- To add `where` condition, add argument in the following format: `${argumentField}_${whereOperator}`.
- whereOperator can be one of `[ "eq", "gte", "gt", "ilike", "in", "like", "lt", "lte", "neq", "nilike", "nin", "nlike", "similar", "nsimilar" ]`.
- To add `order_by` condition, add argument in the following format: `${argumentField}_${orderByOperator}`
- orderOperator can be either `ord`(short form) or `order`.
- After adding all arguments, you are done migrating

#### Visit [hql-cli](https://github.com/product-ride/hql-cli) to enjoy GraphiQL support in single command

### Roadmap

- Babel plugin
- Optimize bundle size
- Apollo Middleware

### Community

The creator of the library is always open to discussions/suggestions. 
Vilva Athiban [Twitter](https://twitter.com/vilvaathibanpb)
