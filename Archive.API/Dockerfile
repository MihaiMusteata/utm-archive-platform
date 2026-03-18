FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["Archive.API/Archive.API.csproj", "Archive.API/"]
COPY ["Archive.Application/Archive.Application.csproj", "Archive.Application/"]
COPY ["Archive.Contracts/Archive.Contracts.csproj", "Archive.Contracts/"]
COPY ["Archive.Domain/Archive.Domain.csproj", "Archive.Domain/"]
COPY ["Archive.Infrastructure/Archive.Infrastructure.csproj", "Archive.Infrastructure/"]

RUN dotnet restore "Archive.API/Archive.API.csproj"

COPY . .
WORKDIR /src/Archive.API
RUN dotnet publish "Archive.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

RUN apt-get update \
    && apt-get install -y --no-install-recommends libgssapi-krb5-2 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "Archive.API.dll"]
