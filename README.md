# Next.js 15 Boilerplate

https://music.youtube.com/playlist?list=OLAK5uy_mYRDUXJvuDMElZKN5f1rAPJEB2uM0witE - новый альбом дарьяны
https://music.youtube.com/playlist?list=OLAK5uy_mJbKoW3JGyY0LrzXK8B6u7sbqJF3ehqZ4 - новый альбом фараона
https://music.youtube.com/playlist?list=OLAK5uy_nD3vrN1YkWpGGklSQefdH_lIASMVupyJA - альбом френдли тага
https://music.youtube.com/playlist?list=OLAK5uy_nn1Ldam22ygDJzT3MujFmvMrOLFPza30c - новый трек фортуны
https://music.youtube.com/playlist?list=OLAK5uy_k-bBqkKO4zEdRc2Mz2cy4w_4AR4nRJjj8 - новый трек ICEGERGERT
https://music.youtube.com/playlist?list=OLAK5uy_ncNl677ltYq_-OGBXM6UycnhotSjxiQNE - новый трек мейби лсп

https://daisyui.com/
https://github.com/aranlucas/react-hook-form-mantine

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

export function Scroller({ loader, children, fetchMoreData }: ScrollerProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      // Set a threshold value to trigger fetching data
      const threshold = 100;

      // Calculate the distance from the bottom of the page
      const scrollPosition = window.innerHeight + window.scrollY;
      const bottomPosition = document.documentElement.offsetHeight - threshold;

      // Check if the user has scrolled to the bottom or beyond the threshold
      if (scrollPosition >= bottomPosition && !isLoading) {
        setIsLoading(true);
        fetchMoreData().then(() => {
          setIsLoading(false);
        });
      }
    };

    // Add event listener for scroll event
    window.addEventListener('scroll', handleScroll);

    // Clean up: remove event listener when component unmounts
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading, fetchMoreData]);

  return (
    <div>
      {children}
      {isLoading && (loader || <p>Loading...</p>)}
    </div>
  );
}
```