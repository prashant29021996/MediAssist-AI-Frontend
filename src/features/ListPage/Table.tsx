import React from "react";
import { TableBody, TableCell, TableHead, TableHeader, TableRow, Table } from "@/components/ui/table";
import { Badge } from "@/components/ui";

export const ListTable = ({headers = [], receptionists = [], onRowClick= (index, value) => {}}: {headers: string[], receptionists: any[], onRowClick: (index: number, value: any) => void}) => {
    return (<Table>
                  <TableHeader>
                    <TableRow>
                        {headers.map((header, index) => (
                          <TableHead key={index}>{header}</TableHead>
                        ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receptionists.map((receptionist, index) => (
                      <TableRow
                        key={receptionist.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() =>
                          onRowClick(index, receptionist)
                        }
                      >
                        <TableCell className="font-medium text-gray-900">
                          {receptionist.first_name} {receptionist.last_name}
                        </TableCell>
                        <TableCell>{receptionist.email}</TableCell>
                        <TableCell>{receptionist.phone || "-"}</TableCell>
                        <TableCell>{receptionist.department || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={receptionist.is_active ? "success" : "danger"}>
                            {receptionist.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>)
}