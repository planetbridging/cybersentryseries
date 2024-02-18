# Use a base image with Node.js
FROM oven/bun

# Set the working directory inside the container
WORKDIR /app

COPY package.json package.json
COPY bun.lockb bun.lockb

RUN bun install
# Copy the src folder to /app
COPY ./ /app/


# Expose the port your application will run on
EXPOSE 8123
EXPOSE 8124

# Command to run your application
CMD ["bun", "run","index.tsx"]