FROM node:lts

WORKDIR /backend

COPY ./package*.json ./

RUN npm install

COPY . .

RUN chmod +x /backend/wait-for-it.sh
RUN chown -R 1000:1000 /backend && chmod -R 755 /backend

USER 1000

EXPOSE 5000

CMD [ "npm", "run", "start" ]
