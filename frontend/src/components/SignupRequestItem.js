import React from "react";

function SignupRequestItem({ request, onApprove, onReject }) {
  return (
    <tr>
      <td className="py-2 px-4 border-b">{request.name}</td>
      <td className="py-2 px-4 border-b">{request.email}</td>
      <td className="py-2 px-4 border-b">{request.requestedRole}</td>
      <td className="py-2 px-4 border-b">{request.permissions.join(", ")}</td>
      <td className="py-2 px-4 border-b">
        <button
          onClick={() => onApprove(request.id)}
          className="bg-green-500 text-white px-2 py-1 rounded mr-2"
        >
          Approve
        </button>
        <button
          onClick={() => onReject(request.id)}
          className="bg-red-500 text-white px-2 py-1 rounded"
        >
          Reject
        </button>
      </td>
    </tr>
  );
}

export default SignupRequestItem;
