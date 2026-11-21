
# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

WORKDIR /app

# Copy project file and restore dependencies
COPY EmployeeManagementAPI.csproj ./
RUN dotnet restore

# Copy remaining source files
COPY . .

# Publish application
RUN dotnet publish EmployeeManagementAPI.csproj -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final

WORKDIR /app

COPY --from=build /app/publish .

# Configure application to listen on Render's HTTP port
ENV ASPNETCORE_URLS=http://+:10000

EXPOSE 10000

ENTRYPOINT ["dotnet", "EmployeeManagementAPI.dll"]
