import {
  Toast,
  ToastDescription,
  ToastTitle,
  VStack,
} from "@gluestack-ui/themed";
import React from "react";

export const AppToast = ({ id, type, title, description }: any) => {
  const bg =
    type === "success"
      ? "$green600"
      : type === "error"
      ? "$red600"
      : "$yellow600";

  return (
    <Toast
      nativeID={id}
      action={type}
      variant="solid"
      p="$4"
      m="$3"
      rounded="$xl"
      bg={bg}
    >
      <VStack space="xs">
        <ToastTitle color="$white" fontWeight="$bold">
          {title}
        </ToastTitle>
        <ToastDescription color="$white">{description}</ToastDescription>
      </VStack>
    </Toast>
  );
};
