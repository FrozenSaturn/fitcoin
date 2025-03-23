import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  onSnapshot,
  doc,
  getDoc,
  deleteDoc,
  setDoc,
  increment,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import "./StoreSection.css"; // Import the new CSS file

// Define the product type
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
}

// Define the cart item type (extending Product)
interface CartItem extends Product {
  quantity: number;
  createdAt: any;
}

const StoreSection: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState<boolean>(false);
  const [purchaseLimit, setPurchaseLimit] = useState<number>(0);

  // Sample products to use as a fallback if nothing is in Firebase "products" collection
  const sampleProducts: Product[] = [
    {
      id: "1",
      name: "Dumbbells",
      description: "A pair of dumbbells ideal for home and gym workouts.",
      price: 49.99,
    },
    {
      id: "2",
      name: "Resistance Bands",
      description: "Different resistance levels for versatile workouts.",
      price: 29.99,
    },
    {
      id: "3",
      name: "Yoga Mat",
      description: "Non-slip surface for yoga and other exercises.",
      price: 19.99,
    },
    {
      id: "4",
      name: "Fitness Tracker Pro",
      description: "Track your heart rate, sleep, and activity levels.",
      price: 199.99,
    },
    {
      id: "5",
      name: "Kettlebell",
      description:
        "Multiple weight options in one kettlebell for strength training.",
      price: 89.99,
    },
  ];

  // Fetch products from the "products" collection in Firebase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        console.log("Fetched product docs:", querySnapshot.docs);
        const productsList: Product[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Product, "id">),
        }));

        if (productsList.length === 0) {
          console.warn(
            "No products found in the 'products' collection, using sample products."
          );
          setProducts(sampleProducts);
        } else {
          setProducts(productsList);
        }
      } catch (error) {
        console.error("Error fetching products: ", error);
      }
    };

    fetchProducts();
  }, []);

  // Fetch the user's purchase limit from Firestore
  useEffect(() => {
    const fetchUserPurchaseLimit = async () => {
      if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.purchaseLimit !== undefined) {
              setPurchaseLimit(data.purchaseLimit);
            }
          } else {
            console.error("User document does not exist.");
          }
        } catch (error) {
          console.error("Error fetching purchase limit: ", error);
        }
      }
    };
    fetchUserPurchaseLimit();
  }, []);

  // Subscribe to cart changes when the cart view is active
  useEffect(() => {
    if (showCart) {
      const unsubscribe = onSnapshot(collection(db, "cart"), (snapshot) => {
        const cartList: CartItem[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<CartItem, "id">),
        }));
        setCartItems(cartList);
      });
      return () => unsubscribe();
    }
  }, [showCart]);

  // Function to add a product to the cart in Firebase
  const addToCart = async (product: Product) => {
    try {
      await addDoc(collection(db, "cart"), {
        ...product,
        quantity: 1,
        createdAt: new Date(),
      });
      alert(`${product.name} added to cart`);
    } catch (error) {
      console.error("Error adding product to cart: ", error);
    }
  };

  // Calculate the total cost of items in the cart
  const totalCost = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Checkout button handler to verify funds and process purchase
  const handleCheckout = async () => {
    if (totalCost > purchaseLimit) {
      alert("Insufficient funds to complete purchase!");
      return;
    }

    try {
      // Calculate points to deduct (1000 points = $50)
      const pointsToDeduct = totalCost * 20;

      // Update user's spent points
      if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(
          userDocRef,
          {
            spentPoints: increment(pointsToDeduct),
          },
          { merge: true }
        );
      }

      // Delete cart items
      const cartSnapshot = await getDocs(collection(db, "cart"));
      await Promise.all(
        cartSnapshot.docs.map((docItem) => deleteDoc(docItem.ref))
      );

      alert("Purchase successful!");
    } catch (error) {
      console.error("Error during checkout: ", error);
      alert("Error processing checkout. Please try again.");
    }
  };

  return (
    <div className="store-section">
      <h2>Our Fitness Store</h2>
      <p>Explore our exclusive range of fitness products!</p>

      <div className="product-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-details">
              <h3>{product.name}</h3>
              <p className="product-price">${product.price}</p>
              <p className="product-description">{product.description}</p>
              <button
                className="btn primary"
                onClick={() => addToCart(product)}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cart section moved to the bottom */}
      <div className="cart-container">
        <button
          className="btn secondary cart-toggle-button"
          onClick={() => setShowCart(!showCart)}
        >
          {showCart ? "Hide Cart" : `View Cart (${cartItems.length})`}
        </button>

        {showCart && (
          <div className="cart-section">
            <h3>Your Cart</h3>
            <div className="cart-summary">
              <p>
                <strong>Purchase Limit:</strong> ${purchaseLimit.toFixed(2)}
              </p>
              <p>
                <strong>Total Cost:</strong> ${totalCost.toFixed(2)}
              </p>
            </div>
            {cartItems.length === 0 ? (
              <p>No items in cart</p>
            ) : (
              <ul className="cart-items">
                {cartItems.map((item) => (
                  <li key={item.id}>
                    <span className="item-name">{item.name}</span>
                    <span className="item-qty">x {item.quantity}</span>
                    <span className="item-price">${item.price}</span>
                  </li>
                ))}
              </ul>
            )}
            <button
              className="btn primary checkout-button"
              onClick={handleCheckout}
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreSection;
