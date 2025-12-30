import api from "./api";

export const getUserProfile = async () => {
  const response = await api.get("auth/profile/");
  return response.data;
};

export const getDashboard = async () => {
  const response = await api.get("auth/dashboard/");
  return response.data;
};

export const initiatePayment = async (paymentData) => {
  const response = await api.post("payment/initiate/", {
    amount: paymentData.amount,
    recipientID: paymentData.recipientID,
    paymentMethod: paymentData.paymentMethod || "Wallet",
    currency: paymentData.currency || "ETB",
  });
  return response.data;
};

export const processPayment = async (paymentID) => {
  const response = await api.post("payment/process/", {
    paymentID: paymentID,
  });
  return response.data;
};

export const cancelPayment = async (paymentID) => {
  const response = await api.post("payment/cancel/", {
    paymentID: paymentID,
  });
  return response.data;
};

export const getPaymentDetails = async (paymentID) => {
  const response = await api.get(`payment/${paymentID}/`);
  return response.data;
};

export const getTransactions = async () => {
  const response = await api.get("transactions/");
  return response.data;
};

export const getTransactionDetails = async (transactionID) => {
  const response = await api.get(`transaction/${transactionID}/`);
  return response.data;
};

export const getReceiptDetails = async (receiptID) => {
  const response = await api.get(`receipt/${receiptID}/`);
  return response.data;
};

export const getNotifications = async () => {
  const response = await api.get("notifications/");
  return response.data;
};

export const calculateFee = async (amount) => {
  const response = await api.get(`fee/calculate/?amount=${amount}`);
  return response.data;
};
