# Next.js 15 Boilerplate

```
import { useState, useEffect, useMemo, lazy, ComponentType } from 'react';

// Тип для пропсов, которые принимает компонент
type DynamicImportProps = Record<string, any>;

// Тип для результата хука
interface UseDynamicImportResult {
  Component: ComponentType<DynamicImportProps> | null;
  loading: boolean;
  error: Error | null;
}

// Кастомный хук
export const useDynamicImport = (filePath: string): UseDynamicImportResult => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Мемоизируем функцию импорта, чтобы избежать повторных вызовов при ререндерах
  const LazyComponent = useMemo(
    () =>
      lazy(() =>
        import(/* @vite-ignore */ filePath).catch((err) => {
          throw new Error(`Failed to load module from ${filePath}: ${err.message}`);
        }),
      ),
    [filePath],
  );

  useEffect(() => {
    let isMounted = true;

    const loadComponent = async () => {
      try {
        setLoading(true);
        setError(null);
        // Предзагрузка компонента
        await import(/* @vite-ignore */ filePath);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load component'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadComponent();

    // Очистка при размонтировании
    return () => {
      isMounted = false;
    };
  }, [filePath]);

  return {
    Component: error ? null : LazyComponent,
    loading,
    error,
  };
};
```

```
// components/Form.tsx
import { useForm, FormProvider, UseFormProps, UseFormReturn } from 'react-hook-form';
import { ReactNode } from 'react';

// Тип для пропсов компонента Form
interface FormProps<TFormValues extends Record<string, any>> {
  children: ReactNode; // Дочерние элементы формы
  onSubmit?: (
    data: TFormValues,
    methods: UseFormReturn<TFormValues>
  ) => void; // Обработчик отправки формы
  formOptions?: UseFormProps<TFormValues>; // Опции для useForm
  [key: string]: any; // Остальные пропсы, которые могут быть переданы в HTML-тег <form>
}

const Form = <TFormValues extends Record<string, any>>({
  children,
  onSubmit,
  formOptions = {},
  ...props
}: FormProps<TFormValues>) => {
  // Инициализируем useForm с переданными опциями
  const methods = useForm<TFormValues>(formOptions);

  // Обработчик отправки формы
  const handleSubmit = methods.handleSubmit((data) => {
    if (onSubmit) {
      onSubmit(data, methods); // Передаем данные формы и методы useForm в обработчик
    }
  });

  return (
    // Оборачиваем форму в FormProvider для предоставления контекста
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit} {...props}>
        {children}
      </form>
    </FormProvider>
  );
};
```

https://daisyui.com/
https://github.com/aranlucas/react-hook-form-mantine

https://chromewebstore.google.com/detail/linguist-%D0%BF%D0%B5%D1%80%D0%B5%D0%B2%D0%BE%D0%B4%D1%87%D0%B8%D0%BA-%D0%B2%D0%B5%D0%B1-%D1%81/gbefmodhlophhakmoecijeppjblibmie?pli=1 - offline переводчик

```
import React, { useState, useEffect, useRef, useCallback } from 'react';

export type ScrollerProps = {
  /**
   * Custom loader to display while fetching data
   */
  loader?: React.ReactNode;

  /**
   * The content within the scroller
   */
  children?: React.ReactNode;

  /**
   * A function that triggers the load for more data.
   * @returns Promise<void>
   */
  fetchMoreData: () => Promise<void>;

  /**
   * Height of the scroller container (default: '400px')
   */
  height?: string;

  /**
   * Threshold in pixels to trigger fetching data before reaching the bottom (default: 100)
   */
  threshold?: number;

  /**
   * Whether to disable the infinite scroll functionality (default: false)
   */
  disabled?: boolean;

  /**
   * Callback triggered when loading starts
   */
  onLoadStart?: () => void;

  /**
   * Callback triggered when loading ends
   */
  onLoadEnd?: () => void;

  /**
   * Custom styles for the scroller container
   */
  style?: React.CSSProperties;

  /**
   * Class name for the scroller container
   */
  className?: string;
};

export function Scroller({
  loader,
  children,
  fetchMoreData,
  height = '400px',
  threshold = 100,
  disabled = false,
  onLoadStart,
  onLoadEnd,
  style,
  className,
}: ScrollerProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Мемоизация функции handleScroll для предотвращения лишних ререндеров
  const handleScroll = useCallback(() => {
    if (!containerRef.current || isLoading || disabled) return;

    const scrollPosition = containerRef.current.scrollTop + containerRef.current.clientHeight;
    const bottomPosition = containerRef.current.scrollHeight - threshold;

    if (scrollPosition >= bottomPosition) {
      setIsLoading(true);
      onLoadStart?.();

      fetchMoreData()
        .then(() => {
          setIsLoading(false);
          onLoadEnd?.();
        })
        .catch((error) => {
          console.error('Error fetching more data:', error);
          setIsLoading(false);
          onLoadEnd?.();
        });
    }
  }, [fetchMoreData, isLoading, threshold, disabled, onLoadStart, onLoadEnd]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true }); // Используем passive для улучшения производительности
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  return (
    <div
      ref={containerRef}
      style={{ overflowY: 'auto', maxHeight: height, ...style }}
      className={className}
    >
      {children}
      {isLoading && loader}
    </div>
  );
}
```

```
import { useEffect, useState, useCallback, useMemo } from 'react';
import axios, { AxiosRequestConfig, Method, AxiosError, isCancel } from 'axios';
import { showNotification } from '@mantine/notifications';

interface UseFetchProps<T> {
  url: string;
  method?: Method; // Метод запроса (GET, POST и т.д.)
  params?: Record<string, any>; // Параметры для запроса
  data?: any; // Данные для POST/PUT запросов
  config?: AxiosRequestConfig; // Дополнительные настройки для axios
  enabled?: boolean; // Опционально, чтобы контролировать выполнение запроса
  skipOnMount?: boolean; // Пропускать запрос при монтировании
  customMessages?: {
    success?: {
      [key in Method]?: string; // Пользовательские сообщения для успешных ответов
    };
    error?: string | ((error: AxiosError) => string); // Пользовательское сообщение для ошибок или функция для обработки ошибок
  };
  onSuccess?: (data: T) => void; // Коллбэк для успешного выполнения
  onError?: (error: AxiosError) => void; // Коллбэк для обработки ошибок
}

interface UseFetchResult<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  refetch: () => Promise<void>; // Функция для повторного запроса, возвращает Promise
  abort: () => void; // Функция для отмены запроса
}

const useFetch = <T>({
  url,
  method = 'GET',
  params,
  data,
  config,
  enabled = true,
  skipOnMount = false,
  customMessages,
  onSuccess,
  onError,
}: UseFetchProps<T>): UseFetchResult<T> => {
  const [dataState, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Используем useMemo для создания AbortController, чтобы избежать лишних ререндеров
  const abortController = useMemo(() => new AbortController(), []);

  const defaultMessages = useMemo(
    () => ({
      success: {
        GET: 'Данные успешно загружены!',
        POST: 'Данные успешно добавлены!',
        PUT: 'Данные успешно обновлены!',
        DELETE: 'Данные успешно удалены!',
      },
      error: 'Произошла ошибка при загрузке данных.',
    }),
    []
  );

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios({
        url,
        method,
        params,
        data,
        ...config,
        signal: abortController.signal,
      });

      setData(response.data);
      onSuccess?.(response.data);

      showNotification({
        title: 'Успех',
        message: customMessages?.success?.[method] || defaultMessages.success[method] || defaultMessages.success.GET,
        color: 'green',
      });
    } catch (err) {
      if (isCancel(err)) {
        return; // Игнорируем ошибку отмены
      }

      const axiosError = err as AxiosError;
      const errorMessage =
        typeof customMessages?.error === 'function'
          ? customMessages.error(axiosError)
          : axiosError.response?.data?.message || customMessages?.error || defaultMessages.error;

      setError(errorMessage);
      onError?.(axiosError);

      showNotification({
        title: 'Ошибка',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  }, [url, method, params, data, config, enabled, customMessages, onSuccess, onError, abortController, defaultMessages]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const abort = useCallback(() => {
    abortController.abort();
  }, [abortController]);

  useEffect(() => {
    if (!skipOnMount) {
      fetchData();
    }

    return () => {
      abort();
    };
  }, [fetchData, skipOnMount, abort]);

  return { data: dataState, error, isLoading, refetch, abort };
};

export default useFetch;

Производные хуки
import useFetch from './useFetch';
import { AxiosRequestConfig, Method } from 'axios';

// Базовая функция для создания хуков с общими настройками
const createFetchHook = <T>(
  method: Method,
  defaultSuccessMessage: string,
  defaultErrorMessage: string
) => {
  return ({
    url,
    params,
    data,
    config,
    enabled,
    skipOnMount,
    customMessages,
    onSuccess,
    onError,
  }: {
    url: string;
    params?: Record<string, any>;
    data?: any;
    config?: AxiosRequestConfig;
    enabled?: boolean;
    skipOnMount?: boolean;
    customMessages?: {
      success?: { [key in Method]?: string };
      error?: string | ((error: any) => string);
    };
    onSuccess?: (data: T) => void;
    onError?: (error: any) => void;
  }) => {
    return useFetch<T>({
      url,
      method,
      params,
      data,
      config,
      enabled,
      skipOnMount,
      customMessages: {
        success: { [method]: defaultSuccessMessage, ...customMessages?.success },
        error: customMessages?.error || defaultErrorMessage,
      },
      onSuccess,
      onError,
    });
  };
};

// Функция для получения данных
export const useGet = createFetchHook('GET', 'Данные успешно загружены!', 'Ошибка при загрузке данных.');

// Функция для создания данных
export const useCreate = createFetchHook('POST', 'Данные успешно созданы!', 'Ошибка при создании данных.');

// Функция для обновления данных
export const useUpdate = createFetchHook('PUT', 'Данные успешно обновлены!', 'Ошибка при обновлении данных.');

// Функция для удаления данных
export const useDelete = createFetchHook('DELETE', 'Данные успешно удалены!', 'Ошибка при удалении данных.');


import useFetch from './useFetch'; // Импортируйте ваш хук useFetch

// Функция для получения данных
export const useGet = <T>(url: string, params?: Record<string, any>, config?: AxiosRequestConfig) => {
  return useFetch<T>({
    url,
    method: 'GET',
    params,
    config,
  });
};

// Функция для создания данных
export const useCreate = <T>(url: string, data: any, config?: AxiosRequestConfig) => {
  return useFetch<T>({
    url,
    method: 'POST',
    data,
    config,
    customMessages: {
      success: {
        POST: 'Данные успешно созданы!',
      },
      error: 'Ошибка при создании данных.',
    },
  });
};

// Функция для обновления данных
export const useUpdate = <T>(url: string, data: any, config?: AxiosRequestConfig) => {
  return useFetch<T>({
    url,
    method: 'PUT',
    data,
    config,
    customMessages: {
      success: {
        PUT: 'Данные успешно обновлены!',
      },
      error: 'Ошибка при обновлении данных.',
    },
  });
};

// Функция для удаления данных
export const useDelete = <T>(url: string, config?: AxiosRequestConfig) => {
  return useFetch<T>({
    url,
    method: 'DELETE',
    config,
    customMessages: {
      success: {
        DELETE: 'Данные успешно удалены!',
      },
      error: 'Ошибка при удалении данных.',
    },
  });
};
```

```
server {
    listen 80;

    location /api {
        proxy_pass http://your-backend-url; # Замените на URL вашего бэкенда
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        root /usr/share/nginx/html; # Путь к вашему фронтенд-приложению
        index index.html;
        try_files $uri $uri/ /index.html; # Для SPA
    }
}
```
