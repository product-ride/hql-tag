import gql from 'graphql-tag'
import hql from './index'

const gqlQuery = gql`
  query getProductById($id: Int!) {
    inventory_buyer_view(
      limit: 10
      offset: 10
      where: { id: { _eq: $id, _gt: "tt" }, category: { _gte: "test" } }
      order_by: {category: asc, description: desc}
    ) {
      category
      id
    }
  }
`;

const hqlQuery = hql`
  query getProductById($id: Int!) {
    inventory_buyer_view(
      limit: 10
      offset: 10
      id_eq: $id
      id_gt: "tt"
      category_gte: "test"
      category_ord: "asc"
      description_ord: "desc"
    ) {
      category
      id
    }
  }
`;

describe('hql Library', () => {
    it('Generate same AST as graphql-tag', () => {
        delete hqlQuery.loc;
        delete gqlQuery.loc;
        expect(hqlQuery).toMatchObject(gqlQuery);
    })
})