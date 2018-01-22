FROM node:8-alpine

WORKDIR /usr/app

COPY package.json .
RUN npm install --quiet

COPY . .

EXPOSE 8080

# GO GO GO
CMD [ "npm", "start" ]
