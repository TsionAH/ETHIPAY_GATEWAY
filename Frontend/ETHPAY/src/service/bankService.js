import api from "./api";

export const processBankPayment = async (paymentData) => {
  const response = await api.post("bank/process/", {
    payment_id: paymentData.payment_id,
    account_number: paymentData.account_number,
    password: paymentData.password,
  });
  return response.data;
};

export const verifyBankAccount = async (accountData) => {
  const response = await api.post("bank/verify/", accountData);
  return response.data;
};

export const createDemoAccount = async (accountData) => {
  const response = await api.post("bank/create-demo/", accountData);
  return response.data;
};

export const getBankAccounts = async () => {
  const response = await api.get("bank/accounts/");
  return response.data;
};