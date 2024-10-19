FROM nginx:1.27.0-bookworm-perl

# Define build argument
# ARG SERVER_NAME=localhost
# ARG SELF_SIGNED_CERT

# Copy configuration templates and files
# COPY ./nginx-conf/nginx.conf.template /etc/nginx/nginx.conf.template
# COPY ./certs /certs

COPY ./nginx-conf/oauth2-proxy.conf /etc/nginx/snippets/oauth2-proxy.conf
COPY ./nginx-conf/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY ./nginx-conf/csp.conf /etc/nginx/snippets/csp.conf

# Substitute SERVER_NAME in the configuration template at build time
# RUN envsubst '${SERVER_NAME}' < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf

# Run certificate generation script if needed
# COPY ./gen-certs.sh /
# RUN /gen-certs.sh $SERVER_NAME

CMD ["nginx", "-g", "daemon off;"]
