import React, {useEffect, useContext, useReducer, useState} from 'react';
import {FETCH_STATUS, HTTP_METHODS} from "../enums";
import './Home.css';
import get from "lodash.get";

const ProductContext = React.createContext();

const ProjectProvider = (props) => {
  const {children, id, preloadedState} = props;
  const initialState = preloadedState || {selected: {id: "", zipcode: "94401"}};
  const [state, setState] = useReducer((state, newState) => ({...state, ...newState}), {
    status: FETCH_STATUS.INIT,
    selectedImageId: "",
    cartCount: 0,
    ...initialState
  });

  async function fetchProduct(itemId, zipcode) {
    setState({status: FETCH_STATUS.LOADING});
    const response = await fetch('/api/item', {
      method: HTTP_METHODS.POST,
      headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
      body: JSON.stringify({id: itemId, zipcode})
    });
    const data = await response.json();
    setState({
      status: FETCH_STATUS.SUCCESS,
      ...{...state, ...data}
    });
  };

  // FETCH product
  useEffect(() => {
    const selectedId = get(preloadedState, "selected.id");
    const selectedZipCode = get(preloadedState, "selected.zipcode", "94401");
    if (!selectedId) {
      fetchProduct(id, selectedZipCode);
    }
  }, []);

  const selectedItemId = get(state, "selected.id");
  const error = get(state, "error"); 
  return (
    <ProductContext.Provider value={{
        ...state,
        fetchProduct,
        updatePageStatus: (newStatus) => setState({...state, status: newStatus}),
        incrementCartCount: () => setState({...state, cartCount: state.cartCount + 1}),
        setZipcode: (newZipcode) => setState({...state, selected: {...state.selected, zipcode: newZipcode}}),
        setSelectedImage: (newImageId) => setState({...state, selectedImageId: newImageId})
      }}>
      {error && <div className="item-not-found">
          <div>Item Not Found, Available items for the demo are:</div>
          <ul>
            <li><a href="http://localhost:4000/item/21311919">http://localhost:4000/item/21311919</a></li>
            <li><a href="http://localhost:4000/item/21311920">http://localhost:4000/item/21311920</a></li>
            <li><a href="http://localhost:4000/item/31311919">http://localhost:4000/item/31311919</a></li>
            <li><a href="http://localhost:4000/item/31311920">http://localhost:4000/item/31311920</a></li>
          </ul>
      </div>}
      {!selectedItemId  && !error && <div>Loading data...</div>}  
      {selectedItemId && !error && children}
    </ProductContext.Provider>
  );
};


const CTA = ({status, selectedItemId, incrementCartCount, updatePageStatus}) => {
  const isInStock = status === "In Stock";
  const btnClass=  isInStock ? "" : "btn-secondary";
  const btnText =  isInStock ? "Add To Cart" : "Notify me";
  return (
    <div className="cta-container separator spacer-v">
      <button
        className={`btn ${btnClass}`}
        onClick={async () => {
          if(isInStock) {
            try {
              updatePageStatus(FETCH_STATUS.LOADING);
              const response = await fetch("/api/addToCart", {
                  method: HTTP_METHODS.POST,
                  headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
                  body: JSON.stringify({id: selectedItemId, quantity: 1})
                }
              );
              const data = await response.json();
              updatePageStatus(FETCH_STATUS.SUCCESS);
              incrementCartCount();
            } catch (e) {
              updatePageStatus(FETCH_STATUS.INIT);
            }
          } else {
            alert("Ok we will notify you");
          }
        }}>
          {btnText}
      </button>
    </div>
  )
};

const Variants = () => {
  const state = useContext(ProductContext);
  const {selected = {}, items = {}, images = {}, fetchProduct} = state;
  const {id:selectedItemId, zipcode} = selected;
  const variants = [];
  for (let itemId in items) {
    const currentItem = get(items, itemId, {});
    const primaryImageId = get(currentItem, "images[0]", "");
    const primaryImageThumb = get(images, `${primaryImageId}.thumb`, "");
    const varinatClassName = selectedItemId === itemId ? "variant active" : "variant";
    variants.push(
      <div className={varinatClassName} key={`varaint-${itemId}`} onClick={() => fetchProduct(itemId, zipcode)} data-cy="variant">
        <img src={primaryImageThumb} />
      </div>
    );
  }
  return (
    <div className="variants-container">
      <div className="spacer-v section-label">{`Available items:`}</div>
      <div className="variants" data-cy="variants-list">
        {variants}
      </div>
    </div>
  )
};

const BOT = () => {
  const state = useContext(ProductContext);
  const {selected = {}, offers = {}, setZipcode, fetchProduct, incrementCartCount, updatePageStatus} = state;
  const selectedItemId = get(selected, "id", "");
  const selectedItem = get(state, `items[${selectedItemId}]`, {});
  const selectedOffer = get(offers, `${get(selectedItem, "offers[0]", "")}`, {});
  const {price = {}, shipping = {}, pickup = {}, status = ""} = selectedOffer;

  const shippingMessage = shipping.amount > 0 
    ? `Shipping costs ${shipping.currency}${shipping.amount}` 
    : "Free Shipping";
  const pickupMessage = pickup 
    ? pickup.amount > 0 
      ?  `Pickup costs ${shipping.currency}${shipping.amount}` 
      : "Free Pickup"
    : "Pickup not available";
  const statusClass = status !== "In Stock" ? "status oos" : "status"; 
  return (
    <div className="bot">
      <div className="price separator spacer-v" data-cy="product-price">{`${price.currency} ${price.amount}`}</div>
      {status !== "In Stock" && <div className={`${statusClass} separator`}>{status}</div>}
      <Variants />
      <CTA
        status={status}
        selectedItemId={selectedItemId}
        incrementCartCount={incrementCartCount}
        updatePageStatus={updatePageStatus}
      />
      <div className="spacer-v section-label">{`Shipping & Delivery Options:`}</div>
      <ul className="fulfillment-options separator">
        <li className="shipping">{shippingMessage}</li>
        <li className="pickup">{pickupMessage}</li>
      </ul>
      <div className="zip-code spacer-v">
        <span className="section-label">Current zipcode:</span>
        <div className="spacer-v">
          <input
            className="txtBox"
            type="text"
            placeholder="Please enter a zipcode"
            value={selected.zipcode}
            onChange={(ev) => setZipcode(ev.target.value)}
            onKeyDown={(ev) => {
              if  (ev.key === "Enter") {
                fetchProduct(selected.id, selected.zipcode);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

const Image = () => {
  const state = useContext(ProductContext);
  const {selected = {}, images, selectedImageId, setSelectedImage} = state;
  const selectedItem = get(state, `items[${get(selected, "id", "")}]`, {});
  const selectedItemImages = get(selectedItem, "images", []);
  const primaryImage = get(images, `${selectedImageId}`, null);
  const thumbnails = [];

  useEffect(() => {
    setSelectedImage(get(selectedItemImages, "0", ""));
  }, [selected]);

  for (let imageId of selectedItemImages) {
    const thumbClass = selectedImageId === imageId ? "thumb active" : "thumb";
    thumbnails.push(
      <div key={imageId} onClick={() => {setSelectedImage(imageId)}} className={thumbClass}>
        <img src={get(images, `${imageId}.thumb`)} />
      </div>
    );
  }
  return (
    <div className="image-container" data-cy="image-container">
      {!primaryImage && <img className="no-image" src="https://dummyimage.com/450x450/d4d4d4/080808&text=N/A" />}
      {primaryImage && <img className="primary" src={primaryImage.main} data-cy="primary-image" />}
      <div className="thumbnail-container">
        {thumbnails}
      </div>
    </div>
  )
};

const Cart = () => {
  const {cartCount} = useContext(ProductContext);
  return (
    <div className="cart">
      Items in 🛒: {cartCount}
    </div>
  );
};

const ATF = () => {
  const state = useContext(ProductContext);
  const {selected = {}, items = {}, offers = {}} = state;
  const selectedItem = get(state, `items[${get(selected, "id", "")}]`, {});
  const {title = ""} = selectedItem;

  return (
    <div className="atf-container">
      <div className="top-section">
        <h1 className="title" data-cy="product-title">{title}</h1>
        <Cart />
      </div>
      <div className="main">
        <Image />
        <BOT />
      </div>
    </div>
  );
};

const Reviews = () => {
  const state = useContext(ProductContext);
  const {ccm = {}, selected = {}, reviews = {}} = state;
  const {enableReviews} = ccm;
  if (!enableReviews) {
    return null;
  }
  const selectedItemId = get(selected, "id", "");
  const selectedItemReviews = get(state, `items[${selectedItemId}].reviews`, []);
  const reviewsEl = [];
  for(let reviewId of selectedItemReviews) {
    const currentReview = get(reviews, reviewId, {});
    const {title, rating, description} = currentReview;
    reviewsEl.push(
      <div className="review spacer-v separator" key={reviewId} data-cy="review">
        <div className="title">{title}</div>
        <div className="rating spacer-v">Rating: {rating}</div>
        <div className="description">{description}</div>
      </div>
    );
  }
  
  return (
    <div className="reviews-container" data-cy="reviews-container">
      <div className="spacer-v section-title">Reviews:</div>
      {reviewsEl}
    </div>
  )


};

const Spinner = () => {
  const {status} = useContext(ProductContext);
  const spinnerClass = status === FETCH_STATUS.LOADING ? "spinner-backdrop" : "spinner-backdrop hidden";
  return (
    <div className={spinnerClass} data-cy="spinner">
      <div className="spinner" />
    </div>
  );
}

const Ads = () => {
  const [ads, setAds] = useState({});  
  useEffect(() => {
    const fetchAds = async () => {
      const apiRoute = "/api/ads";
      const response = await fetch(apiRoute, {method: HTTP_METHODS.GET});
      const data = await response.json();
      setAds(data);
    };

    fetchAds();
  }, []);
  const adsList = [];
  for(let adId in ads) {
    adsList.push(
      <div className="ad" key={adId} data-cy="ad">
        <img src={ads[adId]} />
      </div>
    );
  }
  return (
    <div className="ads-container spacer-v" data-cy="ads-container">
      {adsList}
    </div>
  )
};


const Banner = () => {
  const {pageCategory} = useContext(ProductContext);
  if (pageCategory !== "HOME") {
    return null;
  }
  return (
    <div className="banner spacer-v" data-cy="banner">
      <svg height="150" width="300">
        <text fill="blue" fontSize="20" fontFamily="Verdana" x="30" y="75">
          Home is where the ❤️ is
        </text>
      </svg>
    </div>
  );
};

const Home =  (props) => {
  const {match = {}, preloadedState} = props;
  const {params = {}} = match;
  const {id} = params;
  return (
    <React.Fragment>
      <ProjectProvider id={id} preloadedState={preloadedState}>
        <Spinner />
        <ATF />
        <Banner />
        <Reviews />
      </ProjectProvider>
      <Ads />
    </React.Fragment>
  );
}

export default Home;
