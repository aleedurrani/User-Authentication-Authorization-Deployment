const AdminRoute = ({ element: Component, ...rest }) => {
    const [isAdmin, setIsAdmin] = useState(null); // Null initially while verifying

    useEffect(() => {
        const verifyAdmin = async () => {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            const userFullName = localStorage.getItem('userFullName');

            if (!token || !userId || !userFullName) {
                setIsAdmin(false);
                return;
            }

            try {
                // Call your backend to verify the token and check if the user is an admin
                const response = await fetch('http://localhost:3001/auth/verifyAdmin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        token: token, // Send token in authorization header
                    },
                    body: JSON.stringify({ userId, userFullName }), // Send userId and userFullName in the request body
                });

                if (response.ok) {
                    const data = await response.json();
                    setIsAdmin(data.isAdmin);
                } else {
                    setIsAdmin(false);
                }
            } catch (err) {
                setIsAdmin(false);
            }
        };

        verifyAdmin();
    }, []);

    if (isAdmin === null) {
        // You can add a loading spinner here while verifying admin status
        return <div>Loading...</div>;
    }

    return isAdmin ? (
        <Component {...rest} />
    ) : (
        <Navigate to="/not-authorized" replace />
    );
};

export default AdminRoute;