import React, { useEffect, useState } from "react";
import { Text, View, ActivityIndicator, StyleSheet, Button, Switch } from "react-native";
import { supabase } from "../../lib/supabase";

export default function Validate() {
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [error, setError] = useState('');
    const [post, setPost]: any = useState({});
    const [isSolutionValidated, setIsSolutionValidated] = useState(false);

    useEffect(() => {
        setPost(JSON.parse(localStorage.getItem('currentReport') || ""))
        setIsSolutionValidated(post.REP_is_solution_validated)
    }, []);

    useEffect(() => {
        const fetchUserRole = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setIsAdmin(user.role === "admin");
            } else {
                setError("User not logged in");
            }
            setIsLoading(false);
        };

        fetchUserRole();
    }, []);

    const handleValidationSubmit = async () => {
        const { error } = await supabase
            .from('Report')
            .update({ REP_is_solution_validated: isSolutionValidated })
            .eq('REP_id', post.REP_id);

        if (error) {
            console.error(error);
            setError("Failed to update validation status.");
        } else {
            alert("Validation status updated successfully!");
        }
    };

    if (isLoading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.error}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Report Solution</Text>
            <View style={styles.solutionContainer}>
                <Text style={styles.solutionText}>
                    {post.REP_solution || "This report has currently no solution. If you want to propose one, please contact the creator of this report."}
                </Text>
                <Text style={styles.validationStatus}>
                    {post.REP_is_solution_validated ? "This solution has been validated." : "This solution has not been validated yet."}
                </Text>
            </View>
            {isAdmin && (
                <View style={styles.formContainer}>
                    <Text style={styles.formTitle}>Validate Solution</Text>
                    <View style={styles.switchContainer}>
                        <Text>Validated</Text>
                        <Switch
                            value={isSolutionValidated}
                            onValueChange={setIsSolutionValidated}
                        />
                    </View>
                    <Button title="Submit" onPress={handleValidationSubmit} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    solutionContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 5,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 2,
    },
    solutionText: {
        fontSize: 16,
        marginBottom: 10,
    },
    validationStatus: {
        fontSize: 16,
        fontStyle: 'italic',
        color: '#555',
    },
    formContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 2,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
});
