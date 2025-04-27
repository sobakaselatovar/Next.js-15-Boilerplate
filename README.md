# Next.js 15 Boilerplate

YUP или ZOD


https://music.youtube.com/playlist?list=OLAK5uy_mYRDUXJvuDMElZKN5f1rAPJEB2uM0witE - новый альбом дарьяны
https://music.youtube.com/playlist?list=OLAK5uy_mJbKoW3JGyY0LrzXK8B6u7sbqJF3ehqZ4 - новый альбом фараона
https://music.youtube.com/playlist?list=OLAK5uy_nD3vrN1YkWpGGklSQefdH_lIASMVupyJA - альбом френдли тага
https://music.youtube.com/playlist?list=OLAK5uy_nn1Ldam22ygDJzT3MujFmvMrOLFPza30c - новый трек фортуны
https://music.youtube.com/playlist?list=OLAK5uy_k-bBqkKO4zEdRc2Mz2cy4w_4AR4nRJjj8 - новый трек ICEGERGERT
https://music.youtube.com/playlist?list=OLAK5uy_ncNl677ltYq_-OGBXM6UycnhotSjxiQNE - новый трек мейби лсп

https://music.youtube.com/playlist?list=OLAK5uy_n-eO_EgFs0opO1OKWmAVclouWF9igQafQ - огромный куш Юпи

https://daisyui.com/
https://github.com/aranlucas/react-hook-form-mantine

https://chromewebstore.google.com/detail/linguist-%D0%BF%D0%B5%D1%80%D0%B5%D0%B2%D0%BE%D0%B4%D1%87%D0%B8%D0%BA-%D0%B2%D0%B5%D0%B1-%D1%81/gbefmodhlophhakmoecijeppjblibmie?pli=1 - offline переводчик

```
import React, { useState, useEffect } from 'react';

export type ScrollerProps = {
  /**
   * custom loader to use
   */
  loader?: React.ReactNode;

  /**
   * the content within the scroller
   */
  children?: React.ReactNode

  /**
   * a function that triggers the load for data.
   * @returns anything
   */
  fetchMoreData: () => Promise<void>;
};

interface ScrollerProps {
  loader: React.ReactNode;
  children: React.ReactNode;
  fetchMoreData: () => Promise<void>;
  height?: string; // Пропс для настройки высоты контейнера
}

export function Scroller({ loader, children, fetchMoreData, height = '400px' }: ScrollerProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      // Set a threshold value to trigger fetching data
      const threshold = 100;

      // Calculate the distance from the bottom of the container
      const scrollPosition = containerRef.current.scrollTop + containerRef.current.clientHeight;
      const bottomPosition = containerRef.current.scrollHeight - threshold;

      // Check if the user has scrolled to the bottom or beyond the threshold
      if (scrollPosition >= bottomPosition && !isLoading) {
        setIsLoading(true);
        fetchMoreData().then(() => {
          setIsLoading(false);
        });
      }
    };

    const container = containerRef.current;
    if (container) {
      // Add event listener for scroll event on the container
      container.addEventListener('scroll', handleScroll);
    }

    // Clean up: remove event listener when component unmounts
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isLoading, fetchMoreData]);

  return (
    <div ref={containerRef} style={{ overflowY: 'auto', maxHeight: height }}>
      {children}
      {isLoading && loader}
    </div>
  );
}
```

```
import { useEffect, useState, useCallback } from 'react';
import axios, { AxiosRequestConfig, Method } from 'axios';
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
    error?: string; // Пользовательское сообщение для ошибок
  };
}

interface UseFetchResult<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  refetch: () => void; // Функция для повторного запроса
  abort: () => void; // Функция для отмены запроса
}

const useFetch = <T>({
  url,
  method = 'GET', // По умолчанию GET
  params,
  data,
  config,
  enabled = true,
  skipOnMount = false, // Пропускать запрос при монтировании
  customMessages, // Пользовательские сообщения
}: UseFetchProps<T>): UseFetchResult<T> => {
  const [dataState, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const defaultMessages = {
    success: {
      GET: 'Данные успешно загружены!',
      POST: 'Данные успешно добавлены!',
      PUT: 'Данные успешно обновлены!',
      DELETE: 'Данные успешно удалены!',
    },
    error: 'Произошла ошибка при загрузке данных.',
  };

  const fetchData = useCallback(async () => {
    if (!enabled) return; // Если запрос отключен, ничего не делаем

    const controller = new AbortController();
    setAbortController(controller);
    setIsLoading(true);
    setError(null); // Сбрасываем ошибку перед новым запросом

    try {
      const response = await axios({
        url,
        method,
        params,
        data,
        ...config,
        signal: controller.signal, // Передаем сигнал для отмены
      });
      setData(response.data);
      showNotification({
        title: 'Успех',
        message: customMessages?.success?.[method] || defaultMessages.success[method] || defaultMessages.success.GET,
        color: 'green',
      });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || customMessages?.error || defaultMessages.error);
      } else if (err.name === 'CanceledError') {
        // Игнорируем ошибку отмены
        return;
      } else {
        setError(customMessages?.error || defaultMessages.error);
      }
      showNotification({
        title: 'Ошибка',
        message: error || customMessages?.error || defaultMessages.error,
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  }, [url, method, params, data, config, enabled, customMessages, error]);

  // Функция для повторного запроса
  const refetch = () => {
    fetchData();
  };

  // Функция для отмены запроса
  const abort = () => {
    if (abortController) {
      abortController.abort();
    }
  };

  useEffect(() => {
    if (!skipOnMount) {
      fetchData(); // Выполняем запрос при монтировании и изменении URL или параметров
    }

    return () => {
      abort(); // Отменяем запрос при размонтировании
    };
  }, [fetchData, skipOnMount]);

  return { data: dataState, error, isLoading, refetch, abort };
};

export default useFetch;

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