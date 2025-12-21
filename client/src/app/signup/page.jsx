'use client';
import Register from '../../components/Register';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const router = useRouter();

    const handleSwitchToLogin = () => {
        router.push('/login');
    };

    return <Register onSwitchToLogin={handleSwitchToLogin} />;
}
