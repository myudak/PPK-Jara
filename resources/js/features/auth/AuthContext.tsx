import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type PropsWithChildren,
} from 'react';
import { isAxiosError } from 'axios';

import { api, getApiErrorMessage } from '@/lib/api';
import type { ApiSuccess } from '@/types/api';
import type { User } from '@/types/domain';

interface LoginCredentials {
    email: string;
    password: string;
}

interface AuthContextValue {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshUser = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await api.get<ApiSuccess<User>>('/api/me');
            setUser(response.data.data);
        } catch (requestError: unknown) {
            if (
                isAxiosError(requestError) &&
                (requestError.response?.status === 401 || requestError.response?.status === 403)
            ) {
                setUser(null);
                return;
            }

            setError(getApiErrorMessage(requestError));
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        let isCurrent = true;

        api.get<ApiSuccess<User>>('/api/me')
            .then((response) => {
                if (isCurrent) {
                    setUser(response.data.data);
                }
            })
            .catch((requestError: unknown) => {
                if (!isCurrent) {
                    return;
                }

                if (
                    !isAxiosError(requestError) ||
                    (requestError.response?.status !== 401 && requestError.response?.status !== 403)
                ) {
                    setError(getApiErrorMessage(requestError));
                }

                setUser(null);
            })
            .finally(() => {
                if (isCurrent) {
                    setIsLoading(false);
                }
            });

        return () => {
            isCurrent = false;
        };
    }, []);

    const login = useCallback(async (credentials: LoginCredentials) => {
        setError(null);

        try {
            await api.get('/sanctum/csrf-cookie');
            const response = await api.post<ApiSuccess<User>>('/api/login', credentials);
            setUser(response.data.data);
        } catch (requestError: unknown) {
            const message = getApiErrorMessage(requestError);
            setError(message);
            throw new Error(message, { cause: requestError });
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post('/api/logout');
        } finally {
            setUser(null);
        }
    }, []);

    const value = useMemo(
        () => ({ user, isLoading, error, login, logout, refreshUser }),
        [user, isLoading, error, login, logout, refreshUser],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);

    if (context === null) {
        throw new Error('useAuth must be used inside AuthProvider.');
    }

    return context;
}
