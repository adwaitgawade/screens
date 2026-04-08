import { redirect } from 'next/navigation'

export default function GoogleLoginPage() {
    // Redirect to new sign-in page (legacy route)
    redirect('/(auth)/sign-in')
}