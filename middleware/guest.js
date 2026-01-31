export default function ({ redirect }) {
  if (process.client) {
    const user = localStorage.getItem("user");
    if (user) {
      const role = JSON.parse(user).role;

      const routes = {
        admin: "/admin",
        staff: "/staff",
        customer: "/customer"
      };

      return redirect(routes[role] || "/");
    }
  }
}
