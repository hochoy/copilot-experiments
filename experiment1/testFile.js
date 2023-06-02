import axios from "axios";

async function getUsers() {
  const result = await axios.get("https://api.example.com/users");
  return result;
}

class User {
  constructor(id) {
    this.id = id;
  }

  fetch() {
    return axios.get(`https://api.example.com/users/${this.id}`);
  }
}

const user1 = new User(1);
const userData = user1.fetch();
const users = getUsers();
