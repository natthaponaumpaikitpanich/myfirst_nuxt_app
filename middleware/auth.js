export default function ({ store, redirect }) {
  // กัน store undefined
  if (!store || !store.state) {
    return redirect('/login')
  }

  if (!store.state.user) {
    return redirect('/login')
  }
}
