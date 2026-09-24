/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `machines` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[machineId,name]` on the table `monitoring_points` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "monitoring_points_machineId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "machines_name_key" ON "machines"("name");

-- CreateIndex
CREATE UNIQUE INDEX "monitoring_points_machineId_name_key" ON "monitoring_points"("machineId", "name");
