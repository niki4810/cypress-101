import get from "lodash.get";

// Mock API route to generate item data
const getOfferAndReviews = (offerId, zipcode) => {
  let availability = "";
  try {
    availability = parseInt(zipcode) % 2 !== 0 ? "In Stock" : "Out of stock";
  } catch (e) {
    availability = "Out of stock";
  }

  switch(offerId) {
    case "offer1": {
      return {
        offers: {
          "offer1": {
            price: {
              amount: 100,
              currency: "$"
            },
            shipping: {
              amount: 10,
              currency: "$"
            },
            pickup: {
              amount: 0,
              currency: "$"
            },
            status: availability
          }
        },
        reviews: {
          review1: {
              title: "Lorem ipsum dolor sit amet, consectetur",
              rating: "4.5/5",
              description: "adipiscing elit. Sed mollis placerat sem, ut euismod leo commodo nec. Pellentesque dictum vitae arcu in scelerisque. Fusce tincidunt, lacus a viverra malesuada"
          },
          review2: {
              title: "Cras vel vulputate augue. In vel mauris est",
              rating: "3.25/5",
              description: "Curabitur rutrum nibh nec urna maximus, id lobortis leo imperdiet. Curabitur dapibus lectus ut velit lacinia euismod"
          },
          review3: {
              title: "Morbi eu lobortis tellus. In tincidunt",
              rating: "2.5/5",
              description: "Mauris eleifend sem nec magna consectetur facilisis. Vivamus non augue faucibus sapien tincidunt molestie."
          }
        }
      }
    }
    default: {
      return {
        offers: {
          "offer2": {
            price: {
              amount: 90,
              currency: "$"
            },
            shipping: {
              amount: 5,
              currency: "$"
            },
            status: availability
          }
        },
        reviews: {
          review4: {
              title: "Pellentesque quis lacus rhoncus, ultrices ante in",
              rating: "4.75/5",
              description: "ermentum sit amet euismod vel, elementum id turpis. Suspendisse quis tristique dui. Cras rhoncus rhoncus lectus, vel condimentum magna pretium ac."
          },
          review5: {
              title: "Nam facilisis est non turpis eleifend hendrerit",
              rating: "4.5/5",
              description: "Proin volutpat malesuada est vel congue. Praesent lobortis varius mauris, ac malesuada odio feugiat quis"
          },
          review6: {
              title: "Ut posuere dui eget mi vestibulum, auctor rutrum nulla porttitor",
              rating: "4.25/5",
              description: "Curabitur et lacinia lacus. Ut enim nisi, lobortis blandit elementum eget, euismod in dui. Morbi urna diam, luctus id ipsum sit amet, fringilla mattis tortor."
          }
        }
      };
      break;
    }
  };
};

const itemById = (id) => {
  switch (id) {
    case "31311919":
    case "21311919": {
      return {
        id,
        title: "QC headphones - Black",
        images: ["img1", "img2", "img3"],
        offers: ["offer1"],
        flags: ["clerance", "rollback"],
        reviews: ["review1", "review2", "review3"]
      }
    }
    default: {
      return {
        id,
        title: "QC headphones - Silver",
        images: ["img4", "img5", "img6"],
        offers: ["offer2"],
        reviews: ["review4", "review5", "review6"],
      }
    }
  }
};

const isAValidProduct = (id) => {
  switch (id) {
    case "21311919":
    case "21311920":
    case "31311919":
    case "31311920":
      return true;
    default:
      return false;
  }
};

export const getProduct = (id, zipcode = "94401") => {
  if (!isAValidProduct(id)) {
    return {error: "Product not found"};
  }
  const result = {};
  result.selected = {id, zipcode};
  if (id === "31311919" || id === "31311920") {
    result.pageCategory = "HOME";
    result.items = {
      "31311919": itemById("31311919"),
      "31311920": itemById("31311920")
    };
  } else {
    result.items = {
      "21311919": itemById("21311919"),
      "21311920": itemById("21311920")
    };
  }

  result.images = {
    img1: {
      main: "https://dummyimage.com/450x450/7970db/fff&text=1",
      thumb: "https://dummyimage.com/80x80/7970db/fff&text=1"
    },
    img2: {
      main: "https://dummyimage.com/450x450/8dccab/fff&text=2",
      thumb: "https://dummyimage.com/80x80/8dccab/fff&text=2"
    },
    img3: {
      main: "https://dummyimage.com/450x450/9e7928/fff&text=3",
      thumb: "https://dummyimage.com/80x80/9e7928/fff&text=3"
    },
    img4: {
      main: "https://dummyimage.com/450x450/535aa6/fff&text=4",
      thumb: "https://dummyimage.com/80x80/535aa6/fff&text=4"
    },
    img5: {
        main: "https://dummyimage.com/450x450/bd5b42/fff&text=5",
        thumb: "https://dummyimage.com/80x80/bd5b42/fff&text=5"
    },
    img6: {
        main: "https://dummyimage.com/450x450/bd49b3/fff&text=6",
        thumb: "https://dummyimage.com/80x80/bd49b3/fff&text=6"
    }
  };

  const offerId = get(result, `items.${id}.offers[0]`, "");
  return {...result, ...getOfferAndReviews(offerId, zipcode)};
};

export const getItem = (req, res) => {
  const {body = {}} = req;
  const {id, zipcode} = body;
  const result = getProduct(id, zipcode); 
  setTimeout(() => res.send(result), process.env.API_DELAY);
};
