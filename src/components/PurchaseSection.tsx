import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import "./PurchaseSection.css"; // Import the new CSS

type CouponOffer = {
  id: string;
  title: string;
  cost: number;
  description: string;
};

type PurchasedCoupon = {
  id: string;
  couponId: string;
  title: string;
  cost: number;
  purchasedAt: { toDate: () => Date };
  couponCode: string;
};

const couponOffers: CouponOffer[] = [
  {
    id: "coupon1",
    title: "10% off Supplements",
    cost: 200,
    description: "Save 10% on top supplement brands.",
  },
  {
    id: "coupon2",
    title: "15% off Fitness Gear",
    cost: 400,
    description: "Discount on running shoes, apparel and more.",
  },
  {
    id: "coupon3",
    title: "20% off Gym Membership",
    cost: 600,
    description: "Limited-time discount on gym memberships.",
  },
];

// Utility function to generate a random coupon code.
const generateCouponCode = (): string => {
  // Generates an 8-character uppercase alphanumeric string.
  return Math.random().toString(36).toUpperCase().substring(2, 10);
};

const PurchaseSection: React.FC = () => {
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [redeemedPoints, setRedeemedPoints] = useState<number>(0);
  const [availablePoints, setAvailablePoints] = useState<number>(0);
  const [purchasedCoupons, setPurchasedCoupons] = useState<PurchasedCoupon[]>(
    []
  );
  const [message, setMessage] = useState<string>("");

  // Fetch total workout points from the user's workouts subcollection.
  useEffect(() => {
    const fetchPoints = async () => {
      const workoutCollection = collection(
        db,
        "users",
        auth.currentUser?.uid as string,
        "workouts"
      );
      const snapshot = await getDocs(workoutCollection);
      const sum = snapshot.docs.reduce((acc, doc) => {
        const data = doc.data() as { points: number };
        return acc + (data.points || 0);
      }, 0);
      setTotalPoints(sum);
    };
    fetchPoints();
  }, []);

  // Fetch purchased coupons to compute how many points have been spent.
  useEffect(() => {
    const fetchCoupons = async () => {
      const couponsCollection = collection(
        db,
        "users",
        auth.currentUser?.uid as string,
        "coupons"
      );
      const snapshot = await getDocs(couponsCollection);
      const purchased = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<PurchasedCoupon, "id">),
      }));
      setPurchasedCoupons(purchased);
      const redeemed = purchased.reduce((acc, coupon) => acc + coupon.cost, 0);
      setRedeemedPoints(redeemed);
    };
    fetchCoupons();
  }, []);

  // Compute available points.
  useEffect(() => {
    setAvailablePoints(totalPoints - redeemedPoints);
  }, [totalPoints, redeemedPoints]);

  const handlePurchase = async (coupon: CouponOffer) => {
    if (availablePoints < coupon.cost) {
      setMessage("Insufficient points to purchase this coupon.");
      return;
    }

    const newCode = generateCouponCode();
    try {
      await addDoc(
        collection(db, "users", auth.currentUser?.uid as string, "coupons"),
        {
          couponId: coupon.id,
          title: coupon.title,
          cost: coupon.cost,
          couponCode: newCode,
          purchasedAt: serverTimestamp(),
        }
      );
      setMessage(
        `Successfully purchased ${coupon.title}! Your coupon code is ${newCode}.`
      );

      // Re-fetch purchased coupons to update redeemed points.
      const couponsCollection = collection(
        db,
        "users",
        auth.currentUser?.uid as string,
        "coupons"
      );
      const snapshot = await getDocs(couponsCollection);
      const purchased = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<PurchasedCoupon, "id">),
      }));
      setPurchasedCoupons(purchased);
      const redeemed = purchased.reduce((acc, coupon) => acc + coupon.cost, 0);
      setRedeemedPoints(redeemed);
    } catch (error) {
      console.error("Purchase error:", error);
      setMessage("Purchase failed. Please try again.");
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2 className="section-title">Purchase Coupons</h2>
      <p className="points-display">
        <strong>Available Points:</strong> {availablePoints}
      </p>
      <div className="coupon-container">
        {couponOffers.map((coupon) => (
          <div key={coupon.id} className="coupon-card">
            <h3 className="coupon-title">{coupon.title}</h3>
            <p className="coupon-description">{coupon.description}</p>
            <p className="coupon-cost">
              <strong>Cost:</strong> {coupon.cost} pts
            </p>
            <button
              className="purchase-button"
              onClick={() => handlePurchase(coupon)}
            >
              Purchase
            </button>
          </div>
        ))}
      </div>
      {message && <p className="message-text">{message}</p>}
      <h3 className="purchased-title">Purchased Coupons</h3>
      <div className="purchased-list">
        {purchasedCoupons.map((coupon) => (
          <div key={coupon.id} className="purchased-card">
            {coupon.title} - Cost: {coupon.cost} pts <br />
            Code: <strong>{coupon.couponCode}</strong>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PurchaseSection;
