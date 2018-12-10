SET SERVEROUTPUT ON;
DECLARE
    CURSOR c_static IS
        SELECT * FROM DEPT;
        
    TYPE rc_restrictiv IS REF CURSOR RETURN EMP%ROWTYPE;
    TYPE rc_nerestrictiv IS REF CURSOR;
    v_record DEPT%ROWTYPE;
    v_emp_max EMP%ROWTYPE;
    v_emp_min EMP%ROWTYPE;
    
    c_max rc_restrictiv;
    c_min rc_nerestrictiv;
BEGIN
    OPEN c_static;
    LOOP
        FETCH c_static INTO v_record;
        EXIT WHEN c_static%NOTFOUND OR c_static%NOTFOUND IS NULL;
        DBMS_OUTPUT.put_line('= = = = ' || v_record.dname || ' = = = = ');
        
        --deschid restrictiv
        OPEN c_max FOR
            SELECT * FROM EMP WHERE DEPTNO = v_record.deptno ORDER BY SAL DESC;
        
        FETCH c_max INTO v_emp_max;
        IF c_max%NOTFOUND THEN
            DBMS_OUTPUT.PUT_LINE('No data!');
        ELSE    
            DBMS_OUTPUT.PUT_LINE('Angajatul cu salariul maxim este ' || v_emp_max.ename || ' -> ' || TO_CHAR(v_emp_max.sal));
        END IF;
        CLOSE c_max;        
        
        --deschid nerestrictiv
        OPEN c_min FOR
            SELECT * FROM EMP WHERE DEPTNO = v_record.deptno ORDER BY SAL ASC;
        FETCH c_min INTO v_emp_min;
        IF c_min%NOTFOUND THEN
            DBMS_OUTPUT.PUT_LINE('No data!');
        ELSE
            DBMS_OUTPUT.PUT_LINE('Angajatul cu salariul minim este ' || v_emp_min.ename || ' -> ' || TO_CHAR(v_emp_min.sal));
        END IF;
        CLOSE c_min;
    END LOOP;
END;
/

--SELECT * FROM DEPT;