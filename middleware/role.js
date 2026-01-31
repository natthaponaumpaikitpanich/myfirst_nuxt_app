export default function ({ store, redirect, route }) {
  const role = store.state.user?.role

  if (!role) return redirect('/login')

  if (route.path.startsWith('/admin') && role !== 'admin') {
    return redirect('/')
  }

  if (route.path.startsWith('/staff') && role !== 'staff') {
    return redirect('/')
  }

  if (route.path.startsWith('/customer') && role !== 'customer') {
    return redirect('/')
  }
}
