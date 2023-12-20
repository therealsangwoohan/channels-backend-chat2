Running locally (1):

docker build -t channels-backend-chat2 .

docker run -it -p 8002:80 --env-file .env channels-backend-chat2

Running locally (2):

docker pull --platform linux/x86_64/v8 therealsangwoohan/channels-backend-chat2

docker run -it -p 8002:80 --env-file .env therealsangwoohan/channels-backend-chat2