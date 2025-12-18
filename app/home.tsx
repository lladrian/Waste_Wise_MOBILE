import React, { useContext } from 'react';
import {
    Box,
    VStack,
    Text,
    Heading,
    Button,
    ButtonText,
    ButtonIcon,
    Center,
    HStack,
    Divider,
    Image,
} from '@gluestack-ui/themed';
import { ArrowRightIcon, UserIcon, ShieldIcon } from 'lucide-react-native';
import { router } from 'expo-router';
import { AuthContext } from "@/context/AuthContext";

export interface User {
    _id: string;
    email: string;
    role: string;
    is_verified: boolean; // ✅ use boolean
    [key: string]: any;
}

export default function HomeScreen() {
    const { loading, login } = useContext(AuthContext)!;

    const handleLogin = async (): Promise<void> => {
        router.push('/auth/login');
    };

    const getFormattedDate = (): string => {
        const now = new Date();

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');

        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };


    const handleGuestMode = async (): Promise<void> => {
        const userData: User = {
            _id: "1234567890abcdef12345678",
            email: "guest@gmail.com",
            role: "guest",
            is_verified: true
        };

        await login(userData, getFormattedDate());

        router.replace("/guest/guest-index");
    };


    return (
        <Box flex={1} bg="$backgroundLight0" sx={{ _dark: { bg: '$backgroundDark950' } }}>
            <Center flex={1} px="$4">
                <VStack space="4xl" alignItems="center" w="$full">
                    <VStack space="lg" alignItems="center">
                        <Box
                            bg="$white"
                            w={200}
                            h={200}
                            rounded="$full"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Image
                                source={require("../assets/logo.png")}
                                alt="WasteWise Logo"
                                width={200}
                                height={200}
                                resizeMode="contain"
                            />
                        </Box>

                        <Heading size="2xl" textAlign="center">
                            Welcome
                        </Heading>

                        <Text size="md" color="$textLight500" textAlign="center" maxWidth="$80">
                            Choose how you want to continue. Login for full access or use guest mode for basic features.
                        </Text>
                    </VStack>

                    <VStack space="xl" w="$full" maxWidth="$80">
                        <Button
                            size="lg"
                            variant="solid"
                            action="primary"
                            onPress={handleLogin}
                            isDisabled={loading}
                            sx={{
                                ':active': {
                                    bg: '$primary700',
                                },
                            }}
                        >
                            <HStack space="sm" alignItems="center">
                                <UserIcon size={20} color="white" />
                                <ButtonText>Login to Your Account</ButtonText>
                                <ButtonIcon as={ArrowRightIcon} ml="$2" />
                            </HStack>
                        </Button>

                        {/* Divider with OR text */}
                        <HStack space="md" alignItems="center">
                            <Divider flex={1} />
                            <Text size="sm" color="$textLight400">
                                OR
                            </Text>
                            <Divider flex={1} />
                        </HStack>

                        <Button
                            size="lg"
                            variant="outline"
                            action="secondary"
                            onPress={handleGuestMode}
                            isDisabled={loading}
                            sx={{
                                borderColor: '$primary500',
                                ':active': {
                                    bg: '$primary50',
                                },
                            }}
                        >
                            <HStack space="sm" alignItems="center">
                                <ShieldIcon size={20} color="#007BFF" />
                                <ButtonText color="$primary500">Continue as Guest</ButtonText>
                            </HStack>
                        </Button>
                    </VStack>

                    <VStack space="sm" alignItems="center">
                        <Text size="sm" color="$textLight400" textAlign="center">
                            Guest mode provides limited access
                        </Text>
                        <Text size="xs" color="$textLight500" textAlign="center">
                            Login for personalized experience and full features
                        </Text>
                    </VStack>
                </VStack>
            </Center>
        </Box>
    );
}