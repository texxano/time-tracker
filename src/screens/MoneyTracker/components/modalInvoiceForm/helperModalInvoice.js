import http from "../../../../services/http";
import {
  calculatePriceInclTax,
  calculateTotalPrice,
  calculateTotalTax,
  convertTaxRate,
} from "./lineItems/helperLineItems";

export const findContactWithId = async (
  vendorAddressRecipient,
  customerAddressRecipient,
  setClientUniqueCountryNumber,
  setValues,
) => {
  try {
    const res = await http.get(`/contacts`);
    if (res && res?.list) {

      const isCustomerExist = res.list.find(
        (contact) =>
          contact.name.toLowerCase() === customerAddressRecipient.toLowerCase()
      );
      //project and contact must be exist
      if (isCustomerExist !== undefined) {
        setValues((prev) => ({
          ...prev,
          chooseContact: `${isCustomerExist.name} ${isCustomerExist.address}`,
        }));
        setValues((prev) => ({
          ...prev,
          contactName: `${isCustomerExist.name}`,
        }));
        // case outgoing client first check customerAddressRecipient
        setValues((prev) => ({ ...prev, invoiceType: 0 }));
        setClientUniqueCountryNumber(isCustomerExist.uniqueCountryNumber);

        return;
      } else {
        // case outgoing client first check vendorAddressRecipient

        const isVendorExist = res.list.find(
          (contact) =>
            contact.name.toLowerCase() === vendorAddressRecipient.toLowerCase()
        );

        if (isVendorExist !== undefined) {
          setValues((prev) => ({
            ...prev,
            chooseContact: `${isVendorExist.name} ${isVendorExist.address}`,
          }));
          setValues((prev) => ({
            ...prev,
            contactName: `${isVendorExist.name}`,
          }));

          setValues((prev) => ({ ...prev, invoiceType: 1 }));
          setClientUniqueCountryNumber(isVendorExist.uniqueCountryNumber);

          return;
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};

export const findContactWithoutId = async (
  vendorAddressRecipient,
  customerAddressRecipient,
  setClientUniqueCountryNumber,
  setValues,
) => {
  try {
    const res = await http.get(`/contacts`);

    if (res && res?.list) {
      const isCustomerExist = res.list.find(
        (contact) =>
          contact.name.toLowerCase() === customerAddressRecipient.toLowerCase()
      );
      //project and contact must be exist
      if (isCustomerExist !== undefined) {
        const resProjectCustomer = await http.get(
          `/projects/globalsearch?searchType=0&search=${isCustomerExist.name.toLowerCase()}`
        );
        if (
          resProjectCustomer &&
          resProjectCustomer.list &&
          resProjectCustomer.list.length > 0
        ) {
          const findProject = resProjectCustomer.list[0];

          setValues((prev) => ({
            ...prev,
            chooseProject: findProject.content,
          }));
          setValues((prev) => ({ ...prev, projectId: findProject.projectId }));

          setValues((prev) => ({
            ...prev,
            chooseContact: `${isCustomerExist.name} ${isCustomerExist.address}`,
          }));
          setValues((prev) => ({
            ...prev,
            contactName: `${isCustomerExist.name}`,
          }));
          // case outgoing client first check customerAddressRecipient
          setValues((prev) => ({ ...prev, invoiceType: 0 }));
          setClientUniqueCountryNumber(isCustomerExist.uniqueCountryNumber);
 
          return;
        }
      } else {
        // case outgoing client first check vendorAddressRecipient

        const isVendorExist = res.list.find(
          (contact) =>
            contact.name.toLowerCase() === vendorAddressRecipient.toLowerCase()
        );

        if (isVendorExist !== undefined) {
          const resProjectVendor = await http.get(
            `/projects/globalsearch?searchType=0&search=${isVendorExist.name.toLowerCase()}`
          );

          if (
            resProjectVendor &&
            resProjectVendor.list &&
            resProjectVendor.list.length > 0
          ) {
            const resProjectVendorName = resProjectVendor.list[0];
            console.log(resProjectVendor, "resProjectVendor");
            setValues((prev) => ({
              ...prev,
              chooseProject: resProjectVendorName.content,
            }));
            setValues((prev) => ({
              ...prev,
              projectId: resProjectVendorName.projectId,
            }));

            setValues((prev) => ({
              ...prev,
              chooseContact: `${isVendorExist.name} ${isVendorExist.address}`,
            }));
            setValues((prev) => ({
              ...prev,
              contactName: `${isVendorExist.name}`,
            }));

            setValues((prev) => ({ ...prev, invoiceType: 1 }));
            setClientUniqueCountryNumber(isVendorExist.uniqueCountryNumber);
            return;
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};

export const createPayload = (values, lineItems, mainCurrency, totalPrices) => {
  const {
    title,
    description,
    dueDate,
    projectId,
    invoiceType,
    invoiceDocument,
    invoiceDate,
    chooseContact,
    contactName
  } = values;
  const { total, totalTax } = totalPrices;
  let payload = {
    type: Number(invoiceType),
    title,
    currencyCode: mainCurrency,
    billedAmount: Number(total).toFixed(2),
    totalTax: parseFloat(totalTax).toFixed(2),
    dueDate,
    invoiceDate,
    projectId,
    clientInfo: contactName,
  };

  if (description) {
    payload.description = description;
  }

  if (invoiceDocument && invoiceDocument.fileId) {
    payload.invoiceFileId = invoiceDocument.fileId;
  }

  if (lineItems.length > 0) {
    payload.lineItems = lineItems.map((item) => {
      const obj = {
        name: item.description,
        description: item.description,
        tax: parseFloat(item.totalTax).toFixed(2),
        quantity: item.quantity,
        taxRate: item.taxRate,
        unitPrice: parseFloat(item.unitPrice).toFixed(2),
        currencyCode: item.currencyCode,
      };
      if (item.productCode) {
        obj.productCode = item.productCode;
      }

      return obj;
    });
  }
  return payload;
};

export const handleEditValues = (data, setValues) => {
  const {
    title,
    description,
    dueDate,
    projectId,
    invoiceDocumentResponse,
    projectTitle,
    entryDate,
  } = data;

  const obj = { title };
  description && description !== null
    ? (obj.description = description)
    : (obj.description = "");
  dueDate && dueDate !== null ? (obj.dueDate = dueDate) : (obj.dueDate = "");
  entryDate && entryDate !== null
    ? (obj.entryDate = entryDate)
    : (obj.entryDate = "");
  projectId && projectId !== null
    ? (obj.projectId = projectId)
    : (obj.projectId = "");
  projectTitle && projectTitle !== null
    ? (obj.chooseProject = projectTitle)
    : (obj.chooseProject = "");
  invoiceDocumentResponse && invoiceDocumentResponse !== null
    ? (obj.invoiceDocument = invoiceDocumentResponse)
    : (obj.invoiceDocument = {});
  if (data.type !== undefined) {
    obj.invoiceType = data.type;
  } else {
    obj.invoiceType = 0;
  }

  setValues(obj);
};

export const handleEditFormLineItems = (data) => {
  const newArr = data.map((el) => {
    const priceInclTax = calculatePriceInclTax(
      Number(el.unitPrice),
      convertTaxRate(el.taxRate),
      el.quantity
    );
    const totalPrice = calculateTotalPrice(Number(el.unitPrice), el.quantity);
    const totalTax = calculateTotalTax(
      Number(el.unitPrice),
      convertTaxRate(el.taxRate),
      el.quantity
    );
    return {
      ...el,
      totalPriceInclTax: Number(priceInclTax),
      totalPriceExcTax: Number(totalPrice),
      totalTax: Number(totalTax),
    };
  });
  return newArr;
};
