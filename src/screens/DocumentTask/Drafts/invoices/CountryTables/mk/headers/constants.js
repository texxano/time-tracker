export const headerContent = [
    "document.task.collection.drafts.invoices.invoiceNumber",
    "Date",

    {
      name: "document.task.collection.drafts.invoices.contact",

      arr: [
        "document.task.collection.drafts.invoices.contactInfo",
        "document.task.collection.drafts.invoices.uniqueCountryNumber",
        "document.task.collection.drafts.invoices.totalPrice",
      ],
    },
    {
      name: "document.task.collection.drafts.invoices.taxInfo",

      arr: [
        {
            name:"18,00",
            arr: [
                "document.task.collection.drafts.invoices.base",
                "document.task.collection.drafts.invoices.tax",
              ],
        },
        {
            name:"10,00",
            arr: [
                "document.task.collection.drafts.invoices.base",
                "document.task.collection.drafts.invoices.tax",
              ],
        },
        {
            name:"5,00",
            arr: [
                "document.task.collection.drafts.invoices.base",
                "document.task.collection.drafts.invoices.tax",
              ],
        }
      ],
    },

    "document.task.collection.drafts.invoices.canBeDenied",
    "document.task.collection.drafts.invoices.cannotBeDenied",
    "document.task.collection.drafts.invoices.notes",
  ];