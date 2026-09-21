-- CreateEnum
CREATE TYPE "MachineType" AS ENUM ('Bomba', 'Ventilador');

-- CreateEnum
CREATE TYPE "SensorModel" AS ENUM ('TcAg', 'TcAs', 'HF+');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "MachineType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monitoring_points" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monitoring_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensors" (
    "id" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "model" "SensorModel" NOT NULL,
    "monitoringPointId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sensors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "readings" (
    "id" SERIAL NOT NULL,
    "monitoringPointId" TEXT NOT NULL,
    "seriesName" TEXT NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "readings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "monitoring_points_machineId_idx" ON "monitoring_points"("machineId");

-- CreateIndex
CREATE UNIQUE INDEX "sensors_serialNumber_key" ON "sensors"("serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "sensors_monitoringPointId_key" ON "sensors"("monitoringPointId");

-- CreateIndex
CREATE INDEX "readings_monitoringPointId_seriesName_datetime_idx" ON "readings"("monitoringPointId", "seriesName", "datetime");

-- AddForeignKey
ALTER TABLE "monitoring_points" ADD CONSTRAINT "monitoring_points_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensors" ADD CONSTRAINT "sensors_monitoringPointId_fkey" FOREIGN KEY ("monitoringPointId") REFERENCES "monitoring_points"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readings" ADD CONSTRAINT "readings_monitoringPointId_fkey" FOREIGN KEY ("monitoringPointId") REFERENCES "monitoring_points"("id") ON DELETE CASCADE ON UPDATE CASCADE;
