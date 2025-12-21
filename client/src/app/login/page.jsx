'use client';
import Login from '../../components/Login';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();

    const handleSwitchToRegister = () => {
        router.push('/signup');
    };

    return <Login onSwitchToRegister={handleSwitchToRegister} />;
}
