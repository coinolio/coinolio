FROM node:8

WORKDIR /usr/app

COPY package.json .
RUN npm install --quiet

COPY . .
COPY wait-for-it.sh .

EXPOSE 8080

# GO GO GO
CMD [ "npm", "start" ]
