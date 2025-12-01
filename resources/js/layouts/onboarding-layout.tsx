import { PropsWithChildren } from 'react';
import AppLogo from '@/components/app-logo';
import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { PageProps } from '@/types';
import { logout } from '@/routes';

export default function OnboardingLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<PageProps>().props;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="border-b bg-white dark:bg-gray-800 shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8">
                            <AppLogo />
                        </div>
                        <span className="font-bold text-xl">Tandem</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">
                            {auth.user.email}
                        </span>
                        <Link href={logout.url()} method="post" as="button">
                            <Button variant="ghost" size="sm">
                                <LogOut className="h-4 w-4 mr-2" />
                                Sign Out
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="py-12">
                {children}
            </main>
        </div>
    );
}
