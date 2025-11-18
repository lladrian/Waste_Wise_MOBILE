import { Center, Spinner, Text, VStack } from '@gluestack-ui/themed';
import React from 'react';

interface LoaderProps {
  message?: string;
}

export const Loader: React.FC<LoaderProps> = ({ message = "Loading..." }) => {
  return (
    <Center flex={1} bg="$white">
      <VStack space="md" alignItems="center">
        <Spinner size="large" color="$primary500" />
        <Text color="$secondary500">{message}</Text>
      </VStack>
    </Center>
  );
};
