import java.util.Scanner;

public class Hello {
    public static void main(String[] args) {
        String line;
        Scanner scanner = new Scanner(System.in);

        System.out.println("What is your name?");
        line = scanner.nextLine();
        System.out.println("Hello " + line);
    }
}