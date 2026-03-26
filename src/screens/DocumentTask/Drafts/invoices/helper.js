export const  parseTaxInfo = (taxInfoJson) => {
    const parsedArr = JSON.parse(taxInfoJson);
    const sortedArr = parsedArr.sort(
      (a, b) => parseFloat(b.TaxRate) - parseFloat(a.TaxRate)
    );
    return sortedArr
}