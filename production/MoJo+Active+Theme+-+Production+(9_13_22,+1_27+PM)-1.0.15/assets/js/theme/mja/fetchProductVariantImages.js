import mja from "@mojoactive/lib";

export default async function (productId) {
  /*
  const resp = await mja.bc.gql.query(`
  {
      site {
        product (entityId: ${productId}) {
          variants {
            edges {
              node {
                sku
                options {
                  edges {
                    node {
                      displayName
                      values {
                        edges {
                          node {
                            label
                            entityId
                          }
                        }
                      }
                    }
                  }
                }
                large: defaultImage {
                  url(width: 500)
                }
              }
            }
          }
        }
      }
    }
  `);
  */

  // Original GraphQL Code Wasn’t Getting All Variants - BEGIN
  let variants;

  await fetch(`https://bc.mojoactive.com/products?id=${productId}&include=variants`, {
    method: "GET",
    headers: {
      "X-STOREIDENTIFIER": "cf275027-b466-45e5-9957-65fe819093ca",
    },
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (data[0].variants) {
        variants = data[0]?.variants?.map(({ option_values, image_url }) => {
          const largeImg = image_url;
          var option = {};

          option_values.forEach((oneOption) => {
            if (oneOption.option_display_name.toLowerCase() === 'color') {
              option.entityId = oneOption.id;
              option.label = oneOption.label;
            }
          });

          return { option, large: largeImg };
        });
      }
    });
  // Original GraphQL Code Wasn’t Getting All Variants - END

  /*
  const variants = resp?.site?.product?.variants?.edges.map(it => it.node)
    .map(({ options, large }) => {

      const largeImg = large?.url;
      var option;

      options?.edges.forEach((edge) => {
        if ((edge.node.displayName == 'Color') || (edge.node.displayName == 'color')) {
          option = edge.node?.values?.edges[0]?.node
        }
      });

      // console.log({ option, large: largeImg });
      return { option, large: largeImg }
    });
  */

  return variants;
}
