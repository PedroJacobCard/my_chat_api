# My_chat API

## Description

This is a real-time chat API developed following the principles of the MVC (Model-View-Controller) design pattern. It enables seamless communication between users by allowing the exchange of messages in real time, and web security through encrypt login and routes guard with tokens.

The API leverages WebSockets to establish persistent connections between clients, facilitating low-latency message delivery and live updates across multiple active sessions within the same web application.

## Technologies

- NestJs
- TypeScript
- PostgreSQL
- PrismaORM
- Sockets.io
- JWT

## Interactive API Routes Docs

- https://my-chat-api-hke8.onrender.com/docs

## Models

- User
- Message
- Chat
- ChatParticipants
- Group
- GroupParticipants

## Relations

- User.groups n.m GroupParticipants.userId
- Group.participants n.m GroupParticipants.groupId
- User.chats n.m ChatParticipants.userId
- Chat.participants n.m ChatParticipants.chatId
- User.messages n.1 Message.userId
- Chat.messages n.1 Message.chatId
- Group.messages n.1 Message.groupId
