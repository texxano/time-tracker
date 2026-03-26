import http from "../http";


async function createContact(payload) {
 try {
  const response = await http.post("/contacts", payload);

  return response;
 } catch (error) {
  
 }
}

async function updateContact(payload) {
  try {
    const response = await http.put("/contacts", payload);
    return response;
  } catch (error) {
    
  }

}

async function deleteContact(id) {
  try {
    const response = await http.delete(`/contacts/${id}`);
    return response;
  } catch (error) {
    
  }

}

export const contactServices = {
  createContact,
  updateContact,
  deleteContact,
};
